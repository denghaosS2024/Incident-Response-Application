import { Types } from "mongoose";
import Car, { ICar } from "../models/Car";
import City from "../models/City";
import Incident, { IIncident } from "../models/Incident";

class CarController {
  async getAllCars() {
    try {
      const cars = await Car.find({ assignedCity: null })
        .sort({ name: 1 })
        .select("-__v")
        .exec();

      return cars;
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  }
  /**
   *
   * @returns the list of cars that are available and have a responder assigned
   * @throws an error if the database operation fails
   * @description This method fetches all cars that are available (not assigned to an incident) and have a responder assigned.
   * The cars are sorted by name in ascending order. The method uses the Car model to query the database and returns the result.
   * The method handles any errors that may occur during the database operation and logs them to the console.
   */
  async getAvailableCarsWithResponder() {
    try {
      const cars = await Car.find({
        assignedIncident: null,
        usernames: { $ne: [] },
      })
        .sort({ name: 1 })
        .select("-__v")
        .exec();

      return cars;
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  }

  async createCar(name: string) {
    if (!name.trim()) {
      throw new Error("Car name is required");
    }
    const existingCar = await Car.findOne({ name: name.trim() });
    if (existingCar) {
      throw new Error(`Car with name '${name}' already exists`);
    }
    const car: ICar = new Car({ name: name.trim() });
    return car.save();
  }

  async removeCarById(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Car ID is required");
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Car ID format");
    }
    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Car not found");
    }
    return deleted;
  }

  async updateCarCity(carName: string, cityName: string) {
    // Check if carName is provided
    if (!carName || typeof carName !== "string") {
      throw new Error("Car name is required");
    }

    carName = carName.trim();

    // unassign car from city
    if (!cityName) {
      const car = await Car.findOne({ name: carName });
      if (!car) {
        throw new Error(`Car with name '${carName}' does not exist`);
      }

      if (car.assignedIncident !== null) {
        throw new Error(
          `Cannot unassign car '${carName}' because it is currently assigned to an incident`,
        );
      }
      const updatedCar = await Car.findOneAndUpdate(
        { name: carName },
        { assignedCity: null },
        { new: true },
      );
      return updatedCar;
    }
    //assign car to city
    const car = await Car.findOne({ name: carName });
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`);
    }

    if (typeof cityName !== "string") {
      throw new Error("City name is required");
    }

    const cityExists = await City.findOne({ name: cityName });
    if (!cityExists) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    const updatedCar = await Car.findOneAndUpdate(
      { name: carName },
      { assignedCity: cityName },
      { new: true },
    );
    return updatedCar;
  }

  /**
   *
   * @param carName which is the name of the selected Car
   * @param username which is the username of the responder
   * @param commandingIncident which is the incident that the responder is commanding
   * @returns the updated car
   */
  async addUsernameToCar(
    carName: string,
    username: string,
    commandingIncident: IIncident | null,
  ) {
    try {
      if (!carName || typeof carName !== "string") {
        throw new Error("Car name is required");
      }
      if (!username || typeof username !== "string") {
        throw new Error("Username is required");
      }
      const car: ICar | null = await Car.findOne({
        name: carName,
      });
      if (!car) {
        throw new Error(`Car with name '${carName}' does not exist`);
      }
      if (commandingIncident && !car.assignedIncident) {
        // Validate incident ID before using it in update
        const incidentId = commandingIncident.incidentId;
        if (typeof incidentId !== "string") {
          throw new Error("Invalid incident ID");
        }
        const updatedCar = await Car.findOneAndUpdate(
          { name: carName },
          {
            $addToSet: { usernames: username },
            assignedIncident: commandingIncident.incidentId,
          },
          { new: true },
        );
        return updatedCar;
      }
      const updatedCar: ICar | null = await Car.findOneAndUpdate(
        { name: carName },
        { $addToSet: { usernames: username } },
        { new: true },
      );
      return updatedCar;
    } catch (error) {
      console.error("Error adding username to car:", error);
      throw error;
    }
  }

  async releaseUsernameFromCar(carName: string, username: string) {
    if (!carName || typeof carName !== "string") {
      throw new Error("Car name is required and must be a string");
    }

    if (!username || typeof username !== "string") {
      throw new Error("Username is required and must be a string");
    }

    const car: ICar | null = await Car.findOne({
      name: carName,
    });
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`);
    }
    const updatedCar: ICar | null = await Car.findOneAndUpdate(
      { name: carName },
      { $pull: { usernames: username } },
      { new: true },
    );

    if (!updatedCar) {
      throw new Error(`Failed to update car '${carName}'`);
    }

    if (!updatedCar.usernames || updatedCar.usernames.length === 0) {
      await Incident.findOneAndUpdate(
        { "assignedVehicles.name": carName },
        {
          $pull: {
            assignedVehicles: { name: carName },
          },
        },
        { new: true },
      );
    }

    return updatedCar;
  }

  /**
   *
   * @param name which is the name of the car
   * @returns the car object
   */
  async getCarByName(name: string) {
    try {
      if (!name || typeof name !== "string") {
        throw new Error("Car name is required and must be a string");
      }

      const car: ICar | null = await Car.findOne({
        name: name,
      });
      if (!car) {
        throw new Error(`Car with name '${name}' does not exist`);
      }
      return car;
    } catch (error) {
      console.error("Error fetching car:", error);
      throw error;
    }
  }

  async updateIncident(carName: string, incidentId: string | null) {
    if (!carName || typeof carName !== "string") {
      throw new Error("Car name is required and must be a string");
    }

    const car = await Car.findOne({ name: carName });
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`);
    }
    const updatedCar = await Car.findOneAndUpdate(
      { name: carName },
      { assignedIncident: incidentId },
      { new: true },
    );
    return updatedCar;
  }
}

export default new CarController();
