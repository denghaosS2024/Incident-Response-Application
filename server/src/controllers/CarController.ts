import Car, { ICar } from "../models/Car";

class CarController {
  async getAllCars() {
    return Car.find().sort({ name: 1 }).exec();
  }

  async createCar(name: string) {
    if (!name.trim()) {
      throw new Error("Car name is required");
    }
    const car: ICar = new Car({ name: name.trim() });
    return car.save();
  }

  async removeCarById(id: string) {
    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Car not found");
    }
    return deleted;
  }
}

export default new CarController();
