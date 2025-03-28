import TruckController from '../../src/controllers/TruckController'
import Truck from '../../src/models/Truck'
import * as TestDatabase from '../utils/TestDatabase'

describe('TruckController', () => {
  beforeAll(async () => {
    await TestDatabase.connect()
  })

  afterAll(async () => {
    await TestDatabase.close()
  })

  beforeEach(async () => {
    // Clear the Truck collection before each test
    await Truck.deleteMany({});
  });

  it('should create a truck with a valid name', async () => {
    const truck = await TruckController.createTruck('MyTruck')
    expect(truck.name).toBe('MyTruck')
    expect(truck._id).toBeDefined()
  })

  it('should not create a truck with an empty name', async () => {
    expect.assertions(1)
    try {
      await TruckController.createTruck('')
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe('Truck name is required')
    }
  })

  it('should retrieve all trucks sorted by name', async () => {
    // Create a couple of trucks for testing
    await TruckController.createTruck('ZTruck')
    await TruckController.createTruck('ATruck')

    const trucks = await TruckController.getAllTrucks()
    expect(trucks.length).toBeGreaterThanOrEqual(2)

    // Check if the list is sorted by name
    const names = trucks.map((t) => t.name)
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0)
    }
  })

  it('should remove a truck by ID', async () => {
    const newTruck = await TruckController.createTruck('TempTruck')
    const id = newTruck._id.toString()

    const removed = await TruckController.removeTruckById(id)
    expect(removed.name).toBe('TempTruck')

    const found = await Truck.findById(id)
    expect(found).toBeNull()
  })

    describe('', () => {  
      it('should return trucks that are not assigned to incidents and have responders', async () => {
        // Set up test data
        const testTrucks = [
          // Should be returned: no assigned incident and has responders
          {
            name: 'Truck 1',
            usernames: ['Officer Smith', 'Officer Johnson'],
            assignedIncident: null,
            assignedCity: 'New York',
          },
          // Should be returned: no assigned incident and has responders
          {
            name: 'Truck 2',
            usernames: ['Officer Williams'],
            assignedIncident: null,
            assignedCity: 'New York',
          },
          // Should NOT be returned: has assigned incident
          {
            name: 'Truck 3',
            usernames: ['Officer Brown', 'Officer Davis'],
            assignedIncident: 'INC-001',
            assignedCity: 'New York',
          },
          // Should NOT be returned: no responders
          {
            name: 'Truck 4',
            usernames: [],
            assignedIncident: null,
            assignedCity: 'New York',
          },
          // Should NOT be returned: empty username array
          {
            name: 'Truck 5',
            usernames: [],
            assignedIncident: null,
            assignedCity: 'New York',
          }
        ];
    
        // Insert the test trucks into the database
        await Truck.insertMany(testTrucks);
    
        // Call the method being tested
        const availableTrucks = await TruckController.getAvailableTrucksWithResponder();
    
        // Assertions
        expect(availableTrucks).toBeDefined();
        expect(Array.isArray(availableTrucks)).toBe(true);
        expect(availableTrucks.length).toBe(2);
    
        // Check that the returned trucks are the expected ones
        const truckNames = availableTrucks.map(truck => truck.name).sort();
        expect(truckNames).toEqual(['Truck 1', 'Truck 2'].sort());
    
        // Check that the trucks that should be excluded are not in the result
        expect(truckNames).not.toContain('Truck 3');
        expect(truckNames).not.toContain('Truck 4');
        expect(truckNames).not.toContain('Truck 5');
    
        // Verify that results are sorted by name
        expect(availableTrucks[0].name.localeCompare(availableTrucks[1].name)).toBeLessThanOrEqual(0);
      });
  
      it('should return an empty array when no trucks match the criteria', async () => {
        // Insert trucks that don't match the criteria
        const testTrucks = [
          {
            name: 'Truck 1',
            usernames: [],
            assignedIncident: null,
            assignedCity: 'New York',
          },
          {
            name: 'Truck 2',
            usernames: ['Officer Williams'],
            assignedIncident: 'INC-002',
            assignedCity: 'New York',
          },
        ];
    
        await Truck.insertMany(testTrucks);
    
        // Call the method being tested
        const availableTrucks = await TruckController.getAvailableTrucksWithResponder();
    
        // Assertions
        expect(availableTrucks).toBeDefined();
        expect(Array.isArray(availableTrucks)).toBe(true);
        expect(availableTrucks.length).toBe(0);
      });
  
      it('should throw an error when database operation fails', async () => {
        // Mock the Car.find method to throw an error
        jest.spyOn(Truck, 'find').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
    
        // Assertions
        await expect(TruckController.getAvailableTrucksWithResponder()).rejects.toThrow('Database error');
      });
    });
})
