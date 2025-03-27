import PersonnelController from '../../src/controllers/PersonnelController'
import Car, { ICar } from '../../src/models/Car'
import City, { ICity } from '../../src/models/City'
import Truck, { ITruck } from '../../src/models/Truck'
import User, { IUser } from '../../src/models/User'
import { ROLES } from '../../src/utils/Roles'
import * as TestDatabase from '../utils/TestDatabase'

describe('PersonnelController', () => {
  let policeUser: IUser
  let fireUser: IUser
  let city: ICity
  let car: ICar
  let truck: ITruck

  beforeAll(async () => {
    await TestDatabase.connect()

    // Create test users
    policeUser = await User.create({
      username: 'officer_john',
      role: ROLES.POLICE,
      password: 'dummy-password',
    })
    fireUser = await User.create({
      username: 'fireman_sam',
      role: ROLES.FIRE,
      password: 'dummy-password',
    })

    // Create test city
    city = await City.create({ name: 'Testopolis' })

    // Create test vehicles
    car = await Car.create({ name: 'PoliceCar1' })
    truck = await Truck.create({ name: 'FireTruck1' })
  })

  afterAll(async () => {
    await TestDatabase.close()
  })

  describe('getAllAvailablePersonnel', () => {
    it('should return unassigned police and firefighters sorted by username', async () => {
      const result = await PersonnelController.getAllAvailablePersonnel()
      expect(Array.isArray(result)).toBe(true)
      expect(result.some((u) => u.name === policeUser.username)).toBe(true)
      expect(result.some((u) => u.name === fireUser.username)).toBe(true)
    })
  })

  describe('updatePersonnelCity', () => {
    it('should assign a city to a personnel', async () => {
      const updated = await PersonnelController.updatePersonnelCity(
        policeUser.username,
        city.name,
      )
      expect(updated).toBeDefined()
      expect(updated?.assignedCity).toBe(city.name)
    })

    it('should unassign city if cityName is empty', async () => {
      const updated = await PersonnelController.updatePersonnelCity(
        policeUser.username,
        '',
      )
      expect(updated).toBeDefined()
      expect(updated?.assignedCity).toBeNull()
    })

    it('should throw error if city does not exist', async () => {
      await expect(
        PersonnelController.updatePersonnelCity(fireUser.username, 'GhostTown'),
      ).rejects.toThrow("City 'GhostTown' does not exist in the database")
    })

    it('should throw error if user is not police or firefighter', async () => {
      const citizen = await User.create({
        username: 'civ_user',
        role: ROLES.CITIZEN,
        password: 'dummy-password',
      })
      await expect(
        PersonnelController.updatePersonnelCity(citizen.username, city.name),
      ).rejects.toThrow(
        `Personnel with username '${citizen.username}' does not exist`,
      )
    })
  })

  describe('selectVehicleForPersonnel', () => {
    it('should assign a car to a police officer', async () => {
      const updated = await PersonnelController.selectVehicleForPersonnel(
        policeUser.username,
        car.name,
      )
      expect(updated?.assignedCar).toBe(car.name)
      expect(updated?.assignedVehicleTimestamp).toBeDefined()
    })

    it('should assign a truck to a firefighter', async () => {
      const updated = await PersonnelController.selectVehicleForPersonnel(
        fireUser.username,
        truck.name,
      )
      expect(updated?.assignedTruck).toBe(truck.name)
      expect(updated?.assignedVehicleTimestamp).toBeDefined()
    })

    it('should throw error if vehicle name is missing', async () => {
      await expect(
        PersonnelController.selectVehicleForPersonnel(policeUser.username, ''),
      ).rejects.toThrow('Vehicle name is required')
    })

    it('should throw error if personnel does not exist', async () => {
      await expect(
        PersonnelController.selectVehicleForPersonnel('unknown_user', car.name),
      ).rejects.toThrow("Personnel with username 'unknown_user' does not exist")
    })

    it('should throw error if police car does not exist', async () => {
      await expect(
        PersonnelController.selectVehicleForPersonnel(
          policeUser.username,
          'FakeCar',
        ),
      ).rejects.toThrow("Car with name 'FakeCar' does not exist")
    })

    it('should throw error if fire truck does not exist', async () => {
      await expect(
        PersonnelController.selectVehicleForPersonnel(
          fireUser.username,
          'FakeTruck',
        ),
      ).rejects.toThrow("Truck with name 'FakeTruck' does not exist")
    })

    it('should throw error if user is not police or firefighter', async () => {
      const citizen = await User.create({
        username: 'civ_user2',
        role: ROLES.CITIZEN,
        password: 'dummy-password',
      })
      await expect(
        PersonnelController.selectVehicleForPersonnel(
          citizen.username,
          'Anything',
        ),
      ).rejects.toThrow(
        `Personnel with username '${citizen.username}' is not a police or firefighter`,
      )
    })
  })

  describe('releaseVehicleFromPersonnel', () => {
    it('should release car from police officer', async () => {
      const updated = await PersonnelController.releaseVehicleFromPersonnel(
        policeUser.username,
        car.name,
      )
      expect(updated?.assignedCar).toBeNull()
      expect(updated?.assignedVehicleTimestamp).toBeNull()
    })

    it('should release truck from firefighter', async () => {
      const updated = await PersonnelController.releaseVehicleFromPersonnel(
        fireUser.username,
        truck.name,
      )
      expect(updated?.assignedTruck).toBeNull()
      expect(updated?.assignedVehicleTimestamp).toBeNull()
    })

    it('should throw error if personnel does not exist', async () => {
      await expect(
        PersonnelController.releaseVehicleFromPersonnel('ghost', 'Whatever'),
      ).rejects.toThrow("Personnel with username 'ghost' does not exist")
    })

    it('should throw error if car not found for police', async () => {
      await expect(
        PersonnelController.releaseVehicleFromPersonnel(
          policeUser.username,
          'FakeCar',
        ),
      ).rejects.toThrow("Car with name 'FakeCar' does not exist")
    })

    it('should throw error if truck not found for firefighter', async () => {
      await expect(
        PersonnelController.releaseVehicleFromPersonnel(
          fireUser.username,
          'FakeTruck',
        ),
      ).rejects.toThrow("Truck with name 'FakeTruck' does not exist")
    })

    it('should throw error if user is not police or firefighter', async () => {
      const citizen = await User.create({
        username: 'civ_user3',
        role: ROLES.CITIZEN,
        password: 'dummy-password',
      })
      await expect(
        PersonnelController.releaseVehicleFromPersonnel(
          citizen.username,
          'Whatever',
        ),
      ).rejects.toThrow(
        `Personnel with username '${citizen.username}' is not a police or firefighter`,
      )
    })
  })
})
