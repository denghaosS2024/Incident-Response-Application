import request from 'supertest'
import app from '../../src/app'
import Car from '../../src/models/Car'
import City from '../../src/models/City'
import Truck from '../../src/models/Truck'
import User from '../../src/models/User'
import { ROLES } from '../../src/utils/Roles'
import * as TestDatabase from '../utils/TestDatabase'

describe('Personnel Routes', () => {
  beforeAll(async () => {
    await TestDatabase.connect()
    // Clear data before testing
    await Car.deleteMany({})
    await Truck.deleteMany({})
    await City.deleteMany({})
    await User.deleteMany({})
  })

  afterAll(async () => {
    // Clean up test data
    await Car.deleteMany({})
    await Truck.deleteMany({})
    await City.deleteMany({})
    await User.deleteMany({})
    await TestDatabase.close()
  })

  describe('GET /api/personnel', () => {
    it('should get all available personnel (role Police or Fire) with no assigned city', async () => {
      // Create users; only Police/Fire with assignedCity=null should appear
      await User.create({
        username: 'PoliceNoCity',
        password: 'secret',
        role: ROLES.POLICE,
        assignedCity: null,
      })
      await User.create({
        username: 'FireWithCity',
        password: 'secret',
        role: ROLES.FIRE,
        assignedCity: 'SomeCity',
      })
      await User.create({
        username: 'RandomCivilian',
        password: 'secret',
        role: 'civilian', // not Police or Fire
      })

      const response = await request(app)
        .get('/api/personnel')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(1)
      expect(response.body[0].name).toBe('PoliceNoCity')
    })
  })

  describe('PUT /api/personnel/cities', () => {
    it('should assign a Police user to an existing city', async () => {
      // Create a city
      await City.create({ name: 'TestCity' })

      // Create a police user
      await User.create({
        username: 'Officer1',
        password: 'pw',
        role: ROLES.POLICE,
        assignedCity: null,
      })

      const response = await request(app)
        .put('/api/personnel/cities')
        .send({ username: 'Officer1', cityName: 'TestCity' })
        .expect(200)

      expect(response.body).toHaveProperty('assignedCity', 'TestCity')
    })

    it('should unassign a user from their city if cityName is empty', async () => {
      // The previous test left 'Officer1' assigned to 'TestCity'
      const response = await request(app)
        .put('/api/personnel/cities')
        .send({ username: 'Officer1', cityName: '' })
        .expect(200)

      expect(response.body).toHaveProperty('assignedCity', null)
    })

    it('should return 500 if city does not exist', async () => {
      // Create user
      await User.create({
        username: 'OfficerNoCity',
        password: 'pw',
        role: ROLES.POLICE,
        assignedCity: null,
      })

      const response = await request(app)
        .put('/api/personnel/cities')
        .send({ username: 'OfficerNoCity', cityName: 'NonexistentCity' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/does not exist in the database/i)
    })

    it('should return 500 if user is not Police or Fire', async () => {
      await User.create({
        username: 'BadRoleUser',
        password: 'pw',
        role: 'civilian',
      })

      const response = await request(app)
        .put('/api/personnel/cities')
        .send({ username: 'BadRoleUser', cityName: 'TestCity' })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/does not exist/i) // or something similar from your code
    })
  })

  describe('PUT /api/personnel/vehicles', () => {
    it('should assign a Police user a Car', async () => {
      // Create a Car
      await Car.create({ name: 'SquadCar1' })

      // Create a Police user
      await User.create({
        username: 'OfficerCar',
        password: 'pw',
        role: ROLES.POLICE,
      })

      // Call the route
      const response = await request(app)
        .put('/api/personnel/vehicles')
        .send({
          personnelName: 'OfficerCar',
          commandingIncident: null,
          vehicle: { name: 'SquadCar1' }, 
        })
        .expect(200)

      // Check user was updated
      expect(response.body).toHaveProperty('assignedCar', 'SquadCar1')
      expect(response.body.assignedVehicleTimestamp).toBeTruthy()
    })

    it('should assign a Fire user a Truck', async () => {
      await Truck.create({ name: 'FireTruck1' })
      await User.create({
        username: 'FirefighterTruck',
        password: 'pw',
        role: ROLES.FIRE,
      })

      const response = await request(app)
        .put('/api/personnel/vehicles')
        .send({
          personnelName: 'FirefighterTruck',
          commandingIncident: null,
          vehicle: { name: 'FireTruck1' },
        })
        .expect(200)

      expect(response.body).toHaveProperty('assignedTruck', 'FireTruck1')
    })

    it('should return 500 if user is not Police or Fire', async () => {
      await Car.create({ name: 'SquadCar2' })
      await User.create({
        username: 'RandomUser',
        password: 'pw',
        role: 'civilian',
      })

      const response = await request(app)
        .put('/api/personnel/vehicles')
        .send({
          personnelName: 'RandomUser',
          commandingIncident: null,
          vehicle: { name: 'SquadCar2' },
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/not a police or firefighter/i)
    })
  })

  describe('PUT /api/personnel/vehicles/release', () => {
    it('should release a Car from a Police user', async () => {
      // Create user & assign a car
      await User.create({
        username: 'OfficerRelease',
        password: 'pw',
        role: ROLES.POLICE,
        assignedCar: 'CarToRelease',
        assignedVehicleTimestamp: new Date(),
      })
      // Create that car
      await Car.create({ name: 'CarToRelease' })

      const response = await request(app)
        .put('/api/personnel/vehicles/release')
        .send({
          personnelName: 'OfficerRelease',
          vehicleName: 'CarToRelease',
        })
        .expect(200)

      expect(response.body.assignedCar).toBeNull()
      expect(response.body.assignedVehicleTimestamp).toBeNull()
    })

    it('should release a Truck from a Fire user', async () => {
      // Create user & assign a truck
      await User.create({
        username: 'FirefighterRelease',
        password: 'pw',
        role: ROLES.FIRE,
        assignedTruck: 'TruckToRelease',
        assignedVehicleTimestamp: new Date(),
      })
      // Create that truck
      await Truck.create({ name: 'TruckToRelease' })

      const response = await request(app)
        .put('/api/personnel/vehicles/release')
        .send({
          personnelName: 'FirefighterRelease',
          vehicleName: 'TruckToRelease',
        })
        .expect(200)

      expect(response.body.assignedTruck).toBeNull()
      expect(response.body.assignedVehicleTimestamp).toBeNull()
    })

    it('should return 500 if user does not exist', async () => {
      const response = await request(app)
        .put('/api/personnel/vehicles/release')
        .send({
          personnelName: 'NonExistentUser',
          vehicleName: 'AnyVehicle',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/does not exist/i)
    })

    it('should return 500 if vehicle does not exist for that role', async () => {
      // A police user assigned a non-existent car
      await User.create({
        username: 'OfficerUnknownCar',
        password: 'pw',
        role: ROLES.POLICE,
        assignedCar: 'FakeCar',
      })

      const response = await request(app)
        .put('/api/personnel/vehicles/release')
        .send({
          personnelName: 'OfficerUnknownCar',
          vehicleName: 'FakeCar',
        })
        .expect(500)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/does not exist/i)
    })
  })
})
