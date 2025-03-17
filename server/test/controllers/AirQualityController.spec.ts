// tests/AirQualityController.spec.ts
import fetch, { Response } from 'node-fetch';
import { Server as SocketIOServer } from 'socket.io';
import AirQualityController from '../../src/controllers/AirQualityController';
import AirQuality from '../../src/models/AirQuality';

// Mock external dependencies
jest.mock('node-fetch');
jest.mock('../../src/models/AirQuality');
jest.mock('haversine-distance', () => jest.fn(() => 1609.34));

const mockIo = {
    emit: jest.fn(),
} as unknown as SocketIOServer;

// Mock PurpleAir API response data
const mockSensorData = {
    data: [
        [123, 37.7749, -122.4194, 15.5],
        [456, 37.7750, -122.4195, 20.0],
        [789, 37.7751, -122.4196, 25.0],
    ],
    time_stamp: Date.now(),
};

describe('AirQualityController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AirQualityController.setSocketIO(mockIo);
        process.env.PURPLEAIR_API_KEY_READ = 'test-key';
    });

    describe('getAirQuality', () => {
        it('should fetch and process air quality data correctly', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSensorData),
            } as unknown as Response);

            const result = await AirQualityController.getAirQuality(37.7749, -122.4194);
            expect(result.air_quality).toBeDefined();
            expect(result.sensor_count).toBe(3);
            expect(result.sensors_used).toHaveLength(3);
        });

        it('should handle API errors gracefully', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as unknown as Response);

            await expect(AirQualityController.getAirQuality(0, 0))
                .rejects.toThrow('PurpleAir API returned status: 500');
        });

        it('should handle no sensors found scenario', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [] }),
            } as unknown as Response);

            const result = await AirQualityController.getAirQuality(0, 0);
            expect(result.air_quality).toBe('Unknown');
            expect(result.message).toContain('No sensors found');
        });

        it('should handle invalid API key scenario', async () => {
            process.env.PURPLEAIR_API_KEY_READ = '';
            await expect(AirQualityController.getAirQuality(0, 0))
                .rejects.toThrow('PurpleAir API key is not defined');
        });
    });

    describe('getAllAirQuality', () => {
        it('should return latest readings with proper limits', async () => {
            const mockData = {
                air_qualities: Array.from({ length: 200 }, (_, i) => ({
                    air_quality: 50,
                    timeStamp: Date.now() - i * 600000,
                })),
            };

            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(mockData);

            const result = await AirQualityController.getAllAirQuality('test-location');
            expect(result).toHaveLength(24 * 6);
            expect(result[0].timeStamp).toBeGreaterThan(result[1].timeStamp);
        });

        it('should handle missing location scenario', async () => {
            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(null);
            await expect(AirQualityController.getAllAirQuality('missing-location'))
                .rejects.toThrow('Location with ID missing-location not found');
        });

        it('should fill missing readings with last value', async () => {
            const mockData = {
                air_qualities: Array.from({ length: 10 }, (_, i) => ({
                    air_quality: 50,
                    timeStamp: Date.now() - i * 600000,
                })),
            };

            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(mockData);
            const result = await AirQualityController.getAllAirQuality('test-location');
            expect(result.length).toBe(24 * 6);
            expect(result[10].air_quality).toBe(50);
        });
    });

    describe('addAirQuality', () => {
        it('should create new location if not exists', async () => {
            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(null);

            await AirQualityController.addAirQuality(
                'new-location',
                37.7749,
                -122.4194,
                50,
                Date.now()
            );

            expect(AirQuality.prototype.save).toHaveBeenCalled();
            expect(mockIo.emit).toHaveBeenCalled();
        });

        it('should update existing location', async () => {
            const mockLocation = {
                locationId: 'existing-location',
                air_qualities: [],
                save: jest.fn(),
            };

            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(mockLocation);

            await AirQualityController.addAirQuality(
                'existing-location',
                37.7749,
                -122.4194,
                50,
                Date.now()
            );

            expect(mockLocation.air_qualities.length).toBe(1);
            expect(mockLocation.save).toHaveBeenCalled();
        });

        it('should handle database save errors', async () => {
            (AirQuality.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB Connection Failed'));
            await expect(AirQualityController.addAirQuality('test', 0, 0, 0, 0))
                .rejects.toThrow('DB Connection Failed');
        });
    });

    describe('deleteAirQuality', () => {
        it('should remove existing location and stop updates', async () => {
            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce({ deleteOne: jest.fn() });
            await AirQualityController.deleteAirQuality('existing-location');
            expect(AirQualityController['updateIntervals'].has('existing-location')).toBe(false);
        });

        it('should handle non-existent location deletion', async () => {
            (AirQuality.findOne as jest.Mock).mockResolvedValueOnce(null);
            await expect(AirQualityController.deleteAirQuality('non-existent'))
                .rejects.toThrow('Location with ID non-existent not found');
        });
    });

    describe('getMeasurementQuality', () => {
        it('should return High quality for 3 sensors within 2 miles', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: Array(3).fill([0, 0, 0, 0]) }),
            } as unknown as Response);

            const result = await AirQualityController.getMeasurementQuality(37.7749, -122.4194);
            expect(result.measurement_quality).toBe('High');
        });

        it('should return Medium quality', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [[0, 38, -122, 0]] }),
            } as unknown as Response);

            const result = await AirQualityController.getMeasurementQuality(37.7749, -122.4194);
            expect(result.measurement_quality).toBe('Medium');
        });

        it('should return Low quality', async () => {
            (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [[0, 37, -122, 0]] }),
            } as unknown as Response);

            const result = await AirQualityController.getMeasurementQuality(37.7749, -122.4194);
            expect(result.measurement_quality).toBe('Low');
        });
    });

    describe('Periodic Updates', () => {
        it('should start and stop updates for a location', () => {
            const locationId = 'test-location';
            AirQualityController['startPeriodicUpdates'](locationId, 0, 0);
            expect(AirQualityController['updateIntervals'].has(locationId)).toBe(true);

            AirQualityController['stopPeriodicUpdates'](locationId);
            expect(AirQualityController['updateIntervals'].has(locationId)).toBe(false);
        });

        it('should handle update interval errors', async () => {
            const mockError = new Error('Update failed');
            jest.spyOn(AirQualityController, 'getAirQuality').mockRejectedValue(mockError);

            AirQualityController['startPeriodicUpdates']('test', 0, 0);
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to update'));
        });
    });

    describe('AQI Calculation', () => {
        it('should calculate correct AQI values', () => {
            const testCases = [
                { pm: 10, expected: 42 }, { pm: 30, expected: 88 },
                { pm: 40, expected: 113 }, { pm: 100, expected: 154 },
                { pm: 200, expected: 250 }, { pm: 300, expected: 350 },
                { pm: 400, expected: 450 }, { pm: 600, expected: '-' },
            ];

            testCases.forEach(({ pm, expected }) => {
                expect(AirQualityController['aqiFromPM'](pm)).toEqual(expected);
            });
        });
    });

    describe('Error Handling', () => {
        it('should reject invalid coordinates', async () => {
            await expect(AirQualityController.getAirQuality(91, 181))
                .rejects.toThrow('Invalid latitude or longitude');
        });

        it('should reject empty location ID', async () => {
            await expect(AirQualityController.getAllAirQuality(''))
                .rejects.toThrow('Location ID is required');
        });
    });
});