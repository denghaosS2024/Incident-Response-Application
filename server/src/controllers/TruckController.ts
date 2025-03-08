import Truck, { ITruck } from "../models/Truck";

class TruckController {
  async getAllTrucks() {
    return await Truck.find().sort({ name: 1 }).exec();
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
}

export default new TruckController();
