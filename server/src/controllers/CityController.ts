import Car from "../models/Car";
import City, { ICity } from "../models/City";
import Truck from "../models/Truck";
import Personnel from "../models/User";
import CarController from "./CarController";
import PersonnelController from "./PersonnelController";
import TruckController from "./TruckController";
import UserController from "./UserController";
import { Types } from "mongoose";
import HttpError from "../utils/HttpError";

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
    await Car.updateMany(
      { assignedCity: city.name },
      { $set: { assignedCity: null } },
    );
    await Truck.updateMany(
      { assignedCity: city.name },
      { $set: { assignedCity: null } },
    );
    await Personnel.updateMany(
      { assignedCity: city.name },
      { $set: { assignedCity: null } },
    );

    // Remove the city
    await City.deleteOne({ _id: cityId });

    return {
      message: `City with ID '${cityId}' and its assignments have been removed.`,
    };
  }

  async getCityAssignments(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }

    const cars = await Car.find({ assignedCity: cityName })
      .sort({ name: 1 })
      .exec();
    const trucks = await Truck.find({ assignedCity: cityName })
      .sort({ name: 1 })
      .exec();
    const personnel = await Personnel.find({ assignedCity: cityName })
      .sort({ username: 1 })
      .exec();

    return {
      cars: cars.map(({ _id, name, assignedCity }) => ({
        _id,
        name,
        assignedCity,
      })),
      trucks: trucks.map(({ _id, name, assignedCity }) => ({
        _id,
        name,
        assignedCity,
      })),
      personnel: personnel.map(
        ({
          _id,
          username,
          assignedCity,
          assignedCar,
          assignedTruck,
          assignedVehicleTimestamp,
          role,
        }) => ({
          _id,
          name: username,
          assignedCity,
          ...(assignedVehicleTimestamp ? { assignedVehicleTimestamp } : {}),
          ...(assignedCar ? { assignedCar } : {}),
          ...(assignedTruck ? { assignedTruck } : {}),
          role,
        }),
      ),
    };
  }

  async addCityAssignment(
    cityName: string,
    type: "Car" | "Truck" | "Personnel",
    name: string,
  ) {
    //unassign the vehicle/personnel from the current city
    if (!cityName) {
      if (type === "Car") {
        return await CarController.updateCarCity(name, "");
      } else if (type === "Truck") {
        return await TruckController.updateTruckCity(name, "");
      } else if (type === "Personnel") {
        return await PersonnelController.updatePersonnelCity(name, "");
      }
      throw new Error(`Invalid type '${type}'`);
    }
    // assign the vehicle/personnel to the city
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
      const personnel = await PersonnelController.updatePersonnelCity(
        name,
        cityName,
      );
      return personnel;
    }
    throw new Error(`Invalid type '${type}'`);
  }

  async getCityFireFunding(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    return city.fireFunding;
  }

  async getCityPoliceFunding(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    return city.policeFunding;
  }

  async getCityFireFundingHistory(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    return (await city.populate("fireFundingHistory.sender"))
      .fireFundingHistory;
  }

  async addCityFireFundingHistory(
    reason: string,
    type: "Assign" | "Request",
    senderId: Types.ObjectId,
    amount: number,
    cityName: string,
  ) {
    const city = await City.findOne({ name: cityName });

    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }

    const sender = await UserController.getUserById(senderId.toString());

    if (!sender) {
      throw new Error(`sender '${senderId}' does not exist in the database`);
    }

    const record = {
      type: type,
      sender: sender,
      timestamp: new Date(),
      amount: amount,
      reason: reason,
    };

    if (record.type == "Assign") {
      city.fireFunding += record.amount;
      city.remainingFunding -= record.amount;
    }

    city.fireFundingHistory.push(record);

    city.save();
    return await city.populate("fireFundingHistory.sender");
  }

  async getCityPoliceFundingHistory(cityName: string) {
    const city = await City.findOne({ name: cityName });
    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }

    return (await city.populate("policeFundingHistory.sender"))
      .policeFundingHistory;
  }

  async addCityPoliceFundingHistory(
    reason: string,
    type: "Assign" | "Request",
    senderId: Types.ObjectId,
    amount: number,
    cityName: string,
  ) {
    const city = await City.findOne({ name: cityName });

    if (!city) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }

    const sender = await UserController.getUserById(senderId.toString());

    if (!sender) {
      throw new Error(`sender '${senderId}' does not exist in the database`);
    }

    const record = {
      type: type,
      sender: sender,
      timestamp: new Date(),
      amount: amount,
      reason: reason,
    };

    if (record.type == "Assign") {
      city.policeFunding += record.amount;
      city.remainingFunding -= record.amount;
    }

    city.policeFundingHistory.push(record);

    city.save();
    return await city.populate("policeFundingHistory.sender");
  }

  /**
   * Retrieves the remaining funding for a specified city.
   *
   * @param cityName - The name of the city to fetch the remaining funding for.
   * @returns A promise that resolves to the remaining funding amount of the city.
   * @throws {Error} If the city does not exist in the database.
   * @throws {HttpError} If there is an error during the fetch operation.
   */
  async getCityRemainingFunding(cityName: string) {
    try {
      const city = await City.findOne({ name: cityName });
      if (!city) {
        throw new Error(`City '${cityName}' does not exist in the database`);
      }
      return city.remainingFunding;
    } catch (error) {
      console.log("Error fetching remaining funding:", error);
      throw new HttpError("Fail to fetch remaining funding:", 500);
    }
  }

  /**
   * Retrieves the total unassigned funding requests for a specified city.
   *
   * @param cityName - The name of the city to fetch unassigned funding requests for.
   * @param role - The role of the user making the request (e.g., "Fire Chief" or "Police Chief").
   * @returns A promise that resolves to the total unassigned funding requests amount.
   * @throws {Error} If the city does not exist in the database.
   * @throws {HttpError} If there is an error during the fetch operation.
   */
  async getCityUnassignedFundingRequests(cityName: string, role: string) {
    try {
      const city = await City.findOne({ name: cityName });
      if (!city) {
        throw new Error(`City '${cityName}' does not exist in the database`);
      }
      const fundingHistory =
        role === "Fire Chief"
          ? city.fireFundingHistory || []
          : city.policeFundingHistory || [];

      // Find the index of the last "Assign" entry
      let lastAssignIndex = -1;
      for (let i = fundingHistory.length - 1; i >= 0; i--) {
        if (fundingHistory[i].type === "Assign") {
          lastAssignIndex = i;
          break;
        }
      }

      // Sum up all "Request" entries that came after the last "Assign"
      const requestAmount = fundingHistory
        .slice(lastAssignIndex + 1)
        .filter((entry) => entry.type === "Request")
        .reduce((sum, entry) => sum + (entry.amount || 0), 0);

      return requestAmount;
    } catch (error) {
      console.error("Error fetching unassigned funding requests:", error);
      throw new HttpError("Fail to fetch unassigned funding requests:", 500);
    }
  }

  async updateCityRemainingFunding(cityName: string, amount: number) {
    try {
      const city = await City.findOne({ name: cityName });
      if (!city) {
        throw new Error(`City '${cityName}' does not exist in the database`);
      }
      city.remainingFunding = amount;
      await city.save();
      console.log(city);
      return city;
    } catch (error) {
      console.log("Error fetching remaining funding:", error);
      throw new HttpError("Fail to fetch remaining funding:", 500);
    }
  }

  async updateCityDepartmentFunding(cityName: string, amount: number, role: string) {
    try {
      const city = await City.findOne({ name: cityName });
      if (!city) {
        throw new Error(`City '${cityName}' does not exist in the database`);
      }
      if (role == 'Fire Chief'){
        city.fireFunding = amount;
      }
      if (role == 'Police Chief'){
        city.policeFunding = amount;
      }
      await city.save();
      return city;
    } catch (error) {
      console.log("Error fetching department funding:", error);
      throw new HttpError("Fail to fetch department funding:", 500);
    }
  }
}

export default new CityController();
