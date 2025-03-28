import request from 'supertest'
import app from '../../src/app'
import Truck from '../../src/models/Truck'
import Personnel from '../../src/models/User'
import * as TestDatabase from '../utils/TestDatabase'

describe('Truck Routes', () => {
    beforeAll(async () => {
        await TestDatabase.connect()

        // Clear data before testing
        await Truck.deleteMany({})
        await Personnel.deleteMany({})
    })

    afterAll(async () => {
        // Clean up test data
        await Truck.deleteMany({})
        await Personnel.deleteMany({})

        await TestDatabase.close()
    })

    beforeEach(async () => {
        // Clear the Truck collection before each test
        await Truck.deleteMany({});
    });

    describe('GET /api/trucks/availability', () => {
            it('should return available trucks with responders', async () => {
                // Create test trucks in the database
                const testTrucks = [
                  {
                    name: 'Fire Truck 1',
                    usernames: ['Firefighter Smith', 'Firefighter Johnson'],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Fire Truck 2',
                    usernames: ['Firefighter Williams'],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Fire Truck 3',
                    usernames: ['Firefighter Brown', 'Firefighter Davis'],
                    assignedIncident: 'INC-001',
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Fire Truck 4',
                    usernames: [],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                ];
            
                await Truck.insertMany(testTrucks);
            
                // Make the request to the endpoint
                const response = await request(app)
                  .get('/api/trucks/availability')
                  .expect('Content-Type', /json/)
                  .expect(200);
            
                // Verify the response
                expect(response.body).toBeDefined();
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBe(2);
            
                // Check that the returned trucks are the expected ones
                const truckNames = response.body.map((truck: any) => truck.name).sort((a, b) => a.localeCompare(b));
                expect(truckNames).toEqual(['Fire Truck 1', 'Fire Truck 2'].sort((a, b) => a.localeCompare(b)));
            
                // Verify that results are sorted by name
                expect(response.body[0].name.localeCompare(response.body[1].name)).toBeLessThanOrEqual(0);
        });

        it('should return an empty array when no trucks match the criteria', async () => {
            // Create test trucks that don't match the criteria
            const testTrucks = [
              {
                name: 'Fire Truck 1',
                usernames: [],
                assignedIncident: null,
                assignedCity: 'New York',
              },
              {
                name: 'Fire Truck 2',
                usernames: ['Firefighter Williams'],
                assignedIncident: 'INC-002',
                assignedCity: 'New York',
              },
            ];
        
            await Truck.insertMany(testTrucks);
        
            // Make the request to the endpoint
            const response = await request(app)
              .get('/api/trucks/availability')
              .expect('Content-Type', /json/)
              .expect(200);
        
            // Verify the response
            expect(response.body).toBeDefined();
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
          });
        
          it('should return 500 status when there is a database error', async () => {
            // Mock the Truck.find method to throw an error
            jest.spyOn(Truck, 'find').mockImplementationOnce(() => {
              throw new Error('Database connection failed');
            });
        
            // Make the request to the endpoint
            const response = await request(app)
              .get('/api/trucks/availability')
              .expect('Content-Type', /json/)
              .expect(500);
        
            // Verify the error response
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Database connection failed');
        
            // Restore the original implementation
            jest.restoreAllMocks();
          });

    });
});