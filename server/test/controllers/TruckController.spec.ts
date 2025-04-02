import TruckController from '../../src/controllers/TruckController'
import Incident, { IIncident } from '../../src/models/Incident'
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

  const createTestIncident = async (username: string) => {
    const rawIncident = new Incident({
        incidentId: `I${username}`,
        caller: username,
        openingDate: new Date(),
        incidentState: 'Waiting',
        owner: 'System',
        commander: 'System',
        incidentCallGroup: null,
        SarTasks: []
    })

    return rawIncident.save()
  }
  
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

  it('should remove username and deallocate truck from incident if no usernames remain', async () => {
    await Truck.create({ name: 'Truck1', usernames: ['usr'] })
    await Incident.create({
      incidentId: 'Iusr',
      caller: 'usr',
      incidentNumber: '123',
      assignedVehicles: [{ name: 'Truck1', type: 'Truck' }],
    })

    const updatedTruck = await TruckController.releaseUsernameFromTruck('Truck1', 'usr')
    expect(updatedTruck.usernames!.length).toBe(0)

    const incidentAfter = await Incident.findOne({ incidentNumber: '123' })
    expect(incidentAfter?.assignedVehicles.find(v => v.name === 'Truck1')).toBeUndefined()
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
        const truckNames = availableTrucks.map(truck => truck.name).sort((a, b) => a.localeCompare(b));
        expect(truckNames).toEqual(['Truck 1', 'Truck 2'].sort((a, b) => a.localeCompare(b)));
    
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

      it('should release a username and update both Truck and Incident if needed', async () => {
        await Truck.create({
          name: 'Truck-Integration',
          usernames: ['usr'],
        })
        await Incident.create({
          caller: 'usr',
          incidentId: 'Iusr2',
          incidentNumber: 'INC-999',
          assignedVehicles: [{ name: 'Truck-Integration', type: 'Truck' }],
        })
    
        const result = await TruckController.releaseUsernameFromTruck('Truck-Integration', 'usr')
    
        const updatedTruck = await Truck.findOne({ name: 'Truck-Integration' })
        expect(updatedTruck).toBeDefined()
        expect(updatedTruck?.usernames).toEqual([])
    
        const updatedIncident = await Incident.findOne({ incidentNumber: 'INC-999' })
        expect(updatedIncident).toBeDefined()
        expect(updatedIncident?.assignedVehicles.some(v => v.name === 'Truck-Integration')).toBeUndefined()
    
        expect(result.usernames).toEqual([])
      })
  
      it('should throw an error when database operation fails', async () => {
        // Mock the Car.find method to throw an error
        jest.spyOn(Truck, 'find').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
    
        // Assertions
        await expect(TruckController.getAvailableTrucksWithResponder()).rejects.toThrow('Database error');
      });

      it('should be able to update incident in a truck', async () => {
        const testCar = 
          {
            name: 'Police1',
            usernames: [],
            assignedIncident: '1234',
            assignedCity: 'New York',
          };
        await Truck.create(testCar);
        const truck = await TruckController.updateIncident('Police1','5678');
        expect(truck).toBeDefined();
        expect(truck?.name).toBe('Police1');
        expect(truck?.assignedIncident).toBe('5678');
      });
    });

    describe('TruckController.addUsernameToTruck', () => {
        it('should add a username to a truck without a commanding incident', async () => {
          // Create a test truck
          const truckName = 'Test truck';
          await Truck.create({
            name: truckName,
            type: 'truck',
            usernames: ['Existing User']
          });
      
          // Call the controller method
          const username = 'New User';
          const updatedtruck = await TruckController.addUsernameToTruck(
            truckName,
            username,
            null
          );
      
          // Assertions
          expect(updatedtruck).toBeDefined();
          expect(updatedtruck!.name).toBe(truckName);
          expect(updatedtruck!.usernames).toContain('Existing User');
          expect(updatedtruck!.usernames).toContain(username);
        });
      
        it('should add a username to a truck and assign it to an incident when commanding incident is provided', async () => {
          // Create a test truck
          const truckName = 'Police truck';
          await Truck.create({
            name: truckName,
            type: 'truck',
            usernames: []
          });
      
          // Create a test incident
          const incident = await createTestIncident('Officer Smith');
      
          // Call the controller method
          const username = 'Officer Smith';
          const updatedtruck = await TruckController.addUsernameToTruck(
            truckName,
            username,
            incident.toObject() as IIncident
          );
      
          // Assertions
          expect(updatedtruck).toBeDefined();
          expect(updatedtruck!.name).toBe(truckName);
          expect(updatedtruck!.usernames).toContain(username);
          expect(updatedtruck!.assignedIncident).toBe(incident.incidentId); // Incident should be assigned
        });
      
        it('should throw an error when the truck does not exist', async () => {
          // Try to add a username to a non-existent truck
          const nonExistenttruckName = 'Non-Existent truck';
          const username = 'Test User';
      
          // Call the controller method and expect it to throw
          await expect(
            TruckController.addUsernameToTruck(nonExistenttruckName, username, null)
          ).rejects.toThrow(`Truck with name '${nonExistenttruckName}' does not exist`);
        });
      
        it('should not add duplicate usernames in trucks', async () => {
          // Create a test truck
          const truckName = 'Unique Users truck';
          const username = 'Duplicate User';
          await Truck.create({
            name: truckName,
            type: 'truck',
            usernames: [username] // Username already exists
          });
      
          // Call the controller method with the same username
          const updatedtruck = await TruckController.addUsernameToTruck(
            truckName,
            username,
            null
          );
      
          // Assertions
          expect(updatedtruck).toBeDefined();
          expect(updatedtruck!.usernames).toContain(username);
        });
      });
})
