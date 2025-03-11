/**
 * TruckController.spec.ts
 * Tests for TruckController functionality (createTruck, getAllTrucks, removeTruckById)
 */

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
})
