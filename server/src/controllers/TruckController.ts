import City from "../models/City";
import Truck, { ITruck } from "../models/Truck";

class TruckController {
  async getAllTrucks() {
    return await Truck.find({assignedCity: null }).sort({ name: 1 }).exec();
  }

  async createTruck(name: string) {
    if (!name.trim()) {
      throw new Error("Truck name is required");
    }
    const truck: ITruck = new Truck({ name: name.trim() });
    return truck.save();
  }

  async removeTruckById(id: string) {
    const deleted = await Truck.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Truck not found");
    }
    return deleted;
  }

  async updateTruckCity(truckName: string, cityName: string) {
    if (!cityName) {
      const updatedTruck = await Truck.findOneAndUpdate(
        { name: truckName },
        { assignedCity: null },
        { new: true }
      );
      return updatedTruck;  
    }
    const truck = await Truck.findOne({ name: truckName });
    if (!truck) {
      throw new Error(`Truck with name '${truckName}' does not exist`);
    }
    const cityExists = await City.findOne({ name: cityName });
    if (!cityExists) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    const updatedTruck = await Truck.findOneAndUpdate(
      { name: truckName },
      { assignedCity: cityName },
      { new: true }
    );
    return updatedTruck;
  }
}

export default new TruckController();
