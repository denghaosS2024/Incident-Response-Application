/**
 * CarController.spec.ts
 * Tests for CarController functionality (createCar, getAllCars, removeCarById)
 */

import CarController from '../../src/controllers/CarController'
import Car from '../../src/models/Car'
import * as TestDatabase from '../utils/TestDatabase'

describe('CarController', () => {
  beforeAll(async () => {
    await TestDatabase.connect()
  })

  afterAll(async () => {
    await TestDatabase.close()
  })

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
})
