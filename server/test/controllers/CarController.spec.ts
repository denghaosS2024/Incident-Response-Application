import CarController from '../../src/controllers/CarController'
import Car from '../../src/models/Car'
import * as TestDatabase from '../utils/TestDatabase'
import Incident from '../../src/models/Incident'

describe('CarController', () => {
  beforeAll(async () => {
    await TestDatabase.connect()
  })

  afterAll(async () => {
    await TestDatabase.close()
  })

  beforeEach(async () => {
    // Clear the Car collection before each test
    await Car.deleteMany({});
  });

  it('should create a car with a valid name', async () => {
    const car = await CarController.createCar('MyCar')
    expect(car.name).toBe('MyCar')
    expect(car._id).toBeDefined()
  })

  it('should not create a car with an empty name', async () => {
    expect.assertions(1)
    try {
      await CarController.createCar('')
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe('Car name is required')
    }
  })

  it('should retrieve all cars sorted by name', async () => {
    // Create a couple of cars for testing
    await CarController.createCar('ZCar')
    await CarController.createCar('ACar')

    const cars = await CarController.getAllCars()
    expect(cars.length).toBeGreaterThanOrEqual(2)

    // Check if the list is sorted by name
    const names = cars.map((c) => c.name)
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0)
    }
  })

  it('should remove a car by ID', async () => {
    const newCar = await CarController.createCar('TempCar')
    const id = newCar._id.toString()

    await CarController.removeCarById(id)

    const found = await Car.findById(id)
    expect(found).toBeNull()
  })

  describe('getAvailableCarsWithResponder', () => {  
    it('should return cars that are not assigned to incidents and have responders', async () => {
      // Set up test data
      const testCars = [
        // Should be returned: no assigned incident and has responders
        {
          name: 'Police Car 1',
          usernames: ['Officer Smith', 'Officer Johnson'],
          assignedIncident: null,
          assignedCity: 'New York',
        },
        // Should be returned: no assigned incident and has responders
        {
          name: 'Police Car 2',
          usernames: ['Officer Williams'],
          assignedIncident: null,
          assignedCity: 'New York',
        },
        // Should NOT be returned: has assigned incident
        {
          name: 'Police Car 3',
          usernames: ['Officer Brown', 'Officer Davis'],
          assignedIncident: 'INC-001',
          assignedCity: 'New York',
        },
        // Should NOT be returned: no responders
        {
          name: 'Police Car 4',
          usernames: [],
          assignedIncident: null,
          assignedCity: 'New York',
        },
        // Should NOT be returned: empty username array
        {
          name: 'Police Car 5',
          usernames: [],
          assignedIncident: null,
          assignedCity: 'New York',
        }
      ];
  
      // Insert the test cars into the database
      await Car.insertMany(testCars);
  
      // Call the method being tested
      const availableCars = await CarController.getAvailableCarsWithResponder();
  
      // Assertions
      expect(availableCars).toBeDefined();
      expect(Array.isArray(availableCars)).toBe(true);
      expect(availableCars.length).toBe(2);
  
      // Check that the returned cars are the expected ones
      const carNames = availableCars.map(car => car.name).sort((a, b) => a.localeCompare(b));
      expect(carNames).toEqual(['Police Car 1', 'Police Car 2'].sort((a, b) => a.localeCompare(b)));
  
      // Check that the cars that should be excluded are not in the result
      expect(carNames).not.toContain('Police Car 3');
      expect(carNames).not.toContain('Police Car 4');
      expect(carNames).not.toContain('Police Car 5');
  
      // Verify that results are sorted by name
      expect(availableCars[0].name.localeCompare(availableCars[1].name)).toBeLessThanOrEqual(0);
    });

    it('should return an empty array when no cars match the criteria', async () => {
      // Insert cars that don't match the criteria
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
  
      // Call the method being tested
      const availableCars = await CarController.getAvailableCarsWithResponder();
  
      // Assertions
      expect(availableCars).toBeDefined();
      expect(Array.isArray(availableCars)).toBe(true);
      expect(availableCars.length).toBe(0);
    });

    it('should throw an error when database operation fails', async () => {
      // Mock the Car.find method to throw an error
      jest.spyOn(Car, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
  
      // Assertions
      await expect(CarController.getAvailableCarsWithResponder()).rejects.toThrow('Database error');
    });

    it('should add the username to the car when a responder is added', async () => {
      const testCar = 
        {
          name: 'Police Car 1',
          usernames: [],
          assignedIncident: null,
          assignedCity: 'New York',
        };
      await Car.create(testCar);
      const updatedCar = await CarController.addUsernameToCar('Police Car 1', 'Officer Smith', null);
      expect(updatedCar).toBeDefined();
      expect(updatedCar?.usernames).toContain('Officer Smith');
    });

    it ('should add the username and assign the car to incident when a commander is added', async () => {
      const testCar = 
        {
          name: 'Police Car 1',
          usernames: [],
          assignedIncident: null,
          assignedCity: 'New York',
        };
      const commandingIncident = await Incident.create({ incidentId: 'IJohn', caller: 'John', openingDate: new Date(), incidentState: 'Assigned', owner: 'officer_john', 
            commander: 'officer_john', address: "", type: "U", priority: "E", incidentCallGroup: null})
      await Car.create(testCar);
      const updatedCar = await CarController.addUsernameToCar('Police Car 1', 'Officer Smith', commandingIncident);
      expect(updatedCar).toBeDefined();
      expect(updatedCar?.usernames).toContain('Officer Smith');
      expect(updatedCar?.assignedIncident).toBe('IJohn');
    });

    it('should be able to get car by name', async () => {
      const testCar = 
        {
          name: 'Police Car 1',
          usernames: [],
          assignedIncident: null,
          assignedCity: 'New York',
        };
      await Car.create(testCar);
      const car = await CarController.getCarByName('Police Car 1');
      expect(car).toBeDefined();
      expect(car?.name).toBe('Police Car 1');
      expect(car?.assignedCity).toBe('New York');
    });

    it('should be able to update incident in a car', async () => {
      const testCar = 
        {
          name: 'Police1',
          usernames: [],
          assignedIncident: '1234',
          assignedCity: 'New York',
        };
      await Car.create(testCar);
      const car = await CarController.updateIncident('Police1','5678');
      expect(car).toBeDefined();
      expect(car?.name).toBe('Police1');
      expect(car?.assignedIncident).toBe('5678');
    });
  });
})
