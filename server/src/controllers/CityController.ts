import Car from "../models/Car";
import City, { ICity } from "../models/City";
import Truck from "../models/Truck";
import Personnel from "../models/User";
import CarController from "./CarController";
import PersonnelController from "./PersonnelController";
import TruckController from "./TruckController";

class CityController {

  async getAllCities() {
    return City.find().sort({ name: 1 }).exec();
  }

  /**
   * Creates a new city document
   * @param name The name of the city
   * @returns The newly created city document
   */
  async createCity(name: string) {
    if (!name.trim()) {
      throw new Error("City name is required");
    }
    const existingCity = await City.findOne({ name: name.trim() });
    if (existingCity) {
      throw new Error(`City with name '${name}' already exists`);
    }
    const city: ICity = new City({ name: name.trim() });
    return city.save();
  }

/**
 * Removes a city by its ID and resets the assignedCity field 
 * for all associated cars, trucks, and personnel.
 * 
 * @param cityId The ID of the city to be removed.
 * @returns A confirmation message indicating the city and its assignments were removed.
 * @throws Error if the city does not exist in the database.
 */
async removeCityById(cityId: string) {
  const city = await City.findById(cityId);
  if (!city) {
    throw new Error(`City with ID '${cityId}' not found`);
  }

  // Reset assignedCity to null for all related entities
  await Car.updateMany({ assignedCity: city.name }, { $set: { assignedCity: null } });
  await Truck.updateMany({ assignedCity: city.name }, { $set: { assignedCity: null } });
  await Personnel.updateMany({ assignedCity: city.name }, { $set: { assignedCity: null } });

  // Remove the city
  await City.deleteOne({ _id: cityId });

  return { message: `City with ID '${cityId}' and its assignments have been removed.` };
}

  async getCityAssignments(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
  
    const cars = await Car.find({ assignedCity: cityName }).sort({ name: 1 }).exec();
    const trucks = await Truck.find({ assignedCity: cityName }).sort({ name: 1 }).exec();
    const personnel = await Personnel.find({ assignedCity: cityName }).sort({ username: 1 }).exec();
  
    return {
      cars: cars.map(({ _id, name, assignedCity }) => ({
        _id,
        name,
        assignedCity
      })),
      trucks: trucks.map(({ _id, name, assignedCity }) => ({
        _id,
        name,
        assignedCity
      })),
      personnel: personnel.map(
        ({ _id, username, assignedCity, assignedCar, assignedTruck, assignedVehicleTimestamp, role }) => ({
          _id,
          name: username,
          assignedCity,
          ...(assignedVehicleTimestamp
            ? { assignedVehicleTimestamp }
            : {}),
          ...(assignedCar ? { assignedCar } : {}),
          ...(assignedTruck ? { assignedTruck } : {}),
          role
        })
      )
    };
  }
  
  

  async addCityAssignment(cityName: string, type: "Car" | "Truck" | "Personnel", name: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    if (type === "Car") {
      const car = await CarController.updateCarCity(name, cityName);
      return car;
    } else if (type === "Truck") {
      const truck = await TruckController.updateTruckCity(name, cityName);
      return truck;
    } else if (type === "Personnel") {
      const personnel = await PersonnelController.updatePersonnelCity(name, cityName);
      return personnel;
    }
    throw new Error(`Invalid type '${type}'`);
  }
}

export default new CityController();
