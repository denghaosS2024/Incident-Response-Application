import MapMarker from '../../src/models/MapMarker';
import * as TestDatabase from '../utils/TestDatabase';

describe('MapMarker model', () => {
  beforeAll(TestDatabase.connect);
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  const createTestMarker = async (type: string, latitude: number, longitude: number, description?: string) => {
    const marker = new MapMarker({ type, latitude, longitude, description });
    return marker.save();
  };

  it('should create a map marker with required fields', async () => {
    const marker = await createTestMarker('pin', 40.7128, -74.0060, 'Test Location');

    expect(marker).toBeDefined();
    expect(marker.type).toBe('pin');
    expect(marker.latitude).toBe(40.7128);
    expect(marker.longitude).toBe(-74.0060);
    expect(marker.description).toBe('Test Location');
  });

  it('should not allow missing required fields', async () => {
    expect.assertions(1);
    try {
      await createTestMarker('', 0, 0);
    } catch (e) {
      const error = e as Error;
      expect(error.message).toMatch(/validation failed/i);
    }
  });

  it('should allow an optional description', async () => {
    const marker = await createTestMarker('roadblock', 35.6895, 139.6917);
    expect(marker.description).toBeUndefined();
  });

  it('should retrieve a marker from the database', async () => {
    const marker = await createTestMarker('hydrant', 51.5074, -0.1278, 'Fire hydrant location');
    const retrievedMarker = await MapMarker.findById(marker._id);

    expect(retrievedMarker).toBeDefined();
    expect(retrievedMarker!.type).toBe('hydrant');
  });

  it('should delete a marker', async () => {
    const marker = await createTestMarker('pollution', 34.0522, -118.2437, 'Air quality check');
    await MapMarker.findByIdAndDelete(marker._id);
    const deletedMarker = await MapMarker.findById(marker._id);

    expect(deletedMarker).toBeNull();
  });

  afterAll(TestDatabase.close);
});
