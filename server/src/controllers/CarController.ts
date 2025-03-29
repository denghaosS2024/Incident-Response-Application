import Car, { ICar } from '../models/Car'
import City from '../models/City'
import { IIncident } from '../models/Incident'

class CarController {
  async getAllCars() {
    try {
      const cars = await Car.find({ assignedCity: null })
        .sort({ name: 1 })
        .select('-__v')
        .exec()

      return cars
    } catch (error) {
      console.error('Error fetching cars:', error)
      throw error
    }
  }
  // Get cars that not assigned to an incident and has at least one responder onboard
  async getAvailableCarsWithResponder() {
    try {
      const cars = await Car.find({
        assignedIncident: null,
        usernames: { $ne: [] },
      })
        .sort({ name: 1 })
        .select('-__v')
        .exec()

      return cars
    } catch (error) {
      console.error('Error fetching cars:', error)
      throw error
    }
  }

  async createCar(name: string) {
    if (!name.trim()) {
      throw new Error('Car name is required')
    }
    const existingCar = await Car.findOne({ name: name.trim() })
    if (existingCar) {
      throw new Error(`Car with name '${name}' already exists`)
    }
    const car: ICar = new Car({ name: name.trim() })
    return car.save()
  }

  async removeCarById(id: string) {
    const deleted = await Car.findByIdAndDelete(id)
    if (!deleted) {
      throw new Error('Car not found')
    }
    return deleted
  }

  async updateCarCity(carName: string, cityName: string) {
    if (!cityName) {
      const updatedCar = await Car.findOneAndUpdate(
        { name: carName },
        { assignedCity: null },
        { new: true },
      )
      return updatedCar
    }
    const car = await Car.findOne({ name: carName })
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`)
    }
    const cityExists = await City.findOne({ name: cityName })
    if (!cityExists) {
      throw new Error(`City '${cityName}' does not exist in the database`)
    }
    const updatedCar = await Car.findOneAndUpdate(
      { name: carName },
      { assignedCity: cityName },
      { new: true },
    )
    return updatedCar
  }

  /**
   * 
   * @param carName which is the name of the selected Car
   * @param username which is the username of the responder
   * @param commandingIncident which is the incident that the responder is commanding
   * @returns the updated car 
   */
  async addUsernameToCar(carName: string, username: string, commandingIncident: IIncident | null) {
    try {
      const car: ICar | null = await Car.findOne({
        name: carName,
      })
      if (!car) {
        throw new Error(`Car with name '${carName}' does not exist`)
      }
      if (commandingIncident && !car.assignedIncident ) {
        const updatedCar = await Car.findOneAndUpdate(
          { name: carName },
          { $addToSet: { usernames: username }, 
          assignedIncident: commandingIncident.incidentId },
          { new: true },
        )
        return updatedCar;
      }
      const updatedCar: ICar | null = await Car.findOneAndUpdate(
        { name: carName },
        { $addToSet: { usernames: username } },
        { new: true },
      )
      return updatedCar;
    } catch (error) {
      console.error('Error adding username to car:', error)
      throw error
    }
  }

  async releaseUsernameFromCar(carName: string, username: string) {
    const car: ICar | null = await Car.findOne({
      name: carName,
    })
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`)
    }
    const updatedCar: ICar | null = await Car.findOneAndUpdate(
      { name: carName },
      { $pull: { usernames: username } },
      { new: true },
    )
    return updatedCar
  }

  /**
   * 
   * @param name which is the name of the car
   * @returns the car object
   */
  async getCarByName(name: string) {
    try {
      const car: ICar | null = await Car.findOne({
        name: name,
      })
      if (!car) {
        throw new Error(`Car with name '${name}' does not exist`)
      }
      return car;
    } catch (error) {
      console.error('Error fetching car:', error)
      throw error
    }
  }
}

export default new CarController()
