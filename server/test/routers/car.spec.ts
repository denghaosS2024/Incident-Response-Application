import request from 'supertest'
import app from '../../src/app'
import Car from '../../src/models/Car'
import Personnel from '../../src/models/User'
import * as TestDatabase from '../utils/TestDatabase'

describe('Car Routes', () => {
    beforeAll(async () => {
        await TestDatabase.connect()

        // Clear data before testing
        await Car.deleteMany({})
        await Personnel.deleteMany({})
    })

    afterAll(async () => {
        // Clean up test data
        await Car.deleteMany({})
        await Personnel.deleteMany({})

        await TestDatabase.close()
    })

    beforeEach(async () => {
        // Clear the Car collection before each test
        await Car.deleteMany({});
    });

    describe('GET /api/cars/availability', () => {
            it('should return available cars with responders', async () => {
                // Create test cars in the database
                const testCars = [
                  {
                    name: 'Police Car 1',
                    usernames: ['Officer Smith', 'Officer Johnson'],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Police Car 2',
                    usernames: ['Officer Williams'],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Police Car 3',
                    usernames: ['Officer Brown', 'Officer Davis'],
                    assignedIncident: 'INC-001',
                    assignedCity: 'New York',
                  },
                  {
                    name: 'Police Car 4',
                    usernames: [],
                    assignedIncident: null,
                    assignedCity: 'New York',
                  },
                ];
            
                await Car.insertMany(testCars);
            
                // Make the request to the endpoint
                const response = await request(app)
                  .get('/api/cars/availability')
                  .expect('Content-Type', /json/)
                  .expect(200);
            
                // Verify the response
                expect(response.body).toBeDefined();
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBe(2);
            
                // Check that the returned cars are the expected ones
                const carNames = response.body.map((car: any) => car.name).sort((a, b) => a.localeCompare(b));
                expect(carNames).toEqual(['Police Car 1', 'Police Car 2'].sort((a, b) => a.localeCompare(b)));
            
                // Verify that results are sorted by name
                expect(response.body[0].name.localeCompare(response.body[1].name)).toBeLessThanOrEqual(0);
        });

        it('should return an empty array when no cars match the criteria', async () => {
            // Create test cars that don't match the criteria
            const testCars = [
              {
                name: 'Police Car 1',
                usernames: [],
                assignedIncident: null,
                assignedCity: 'New York',
              },
              {
                name: 'Police Car 2',
                usernames: ['Officer Williams'],
                assignedIncident: 'INC-002',
                assignedCity: 'New York',
              },
            ];
        
            await Car.insertMany(testCars);
        
            // Make the request to the endpoint
            const response = await request(app)
              .get('/api/cars/availability')
              .expect('Content-Type', /json/)
              .expect(200);
        
            // Verify the response
            expect(response.body).toBeDefined();
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
          });
        
          it('should return 500 status when there is a database error', async () => {
            // Mock the Car.find method to throw an error
            jest.spyOn(Car, 'find').mockImplementationOnce(() => {
              throw new Error('Database connection failed');
            });
        
            // Make the request to the endpoint
            const response = await request(app)
              .get('/api/cars/availability')
              .expect('Content-Type', /json/)
              .expect(500);
        
            // Verify the error response
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Database connection failed');
        
            // Restore the original implementation
            jest.restoreAllMocks();
          });

    })
});