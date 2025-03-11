/**
 * CityController.spec.ts
 * Tests for CityController functionality (createCity, getAllCities, removeCityById)
 */

import CityController from '../../src/controllers/CityController'
import City from '../../src/models/City'
import * as TestDatabase from '../utils/TestDatabase'

describe('CityController', () => {
  beforeAll(async () => {
    await TestDatabase.connect()
  })

  afterAll(async () => {
    await TestDatabase.close()
  })

  it('should create a city with a valid name', async () => {
    const city = await CityController.createCity('MyCity')
    expect(city.name).toBe('MyCity')
    expect(city._id).toBeDefined()
  })

  it('should not create a city with an empty name', async () => {
    expect.assertions(1)
    try {
      await CityController.createCity('')
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe('City name is required')
    }
  })

  it('should retrieve all cities sorted by name', async () => {
    // Create a couple of cities for testing
    await CityController.createCity('ZCity')
    await CityController.createCity('ACity')

    const cities = await CityController.getAllCities()
    expect(cities.length).toBeGreaterThanOrEqual(2)

    // Check if the list is sorted by name
    const names = cities.map((c) => c.name)
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0)
    }
  })

  it('should remove a city by ID', async () => {
    const newCity = await CityController.createCity('TempCity')
    const id = newCity._id.toString()

    const removed = await CityController.removeCityById(id)
    expect(removed.name).toBe('TempCity')

    const found = await City.findById(id)
    expect(found).toBeNull()
  })
})
