import Car, { ICar } from "../models/Car";
import City from "../models/City";

class CarController {
  async getAllCars() {
    return Car.find({ assignedCity: null }).sort({ name: 1 }).exec();
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

  async updateCarCity(carName: string, cityName: string) {
    if (!cityName) {
      const updatedCar = await Car.findOneAndUpdate(
        { name: carName },
        { assignedCity: null },
        { new: true }
      );
      return updatedCar;
    }
    const car = await Car.findOne({ name: carName });
    if (!car) {
      throw new Error(`Car with name '${carName}' does not exist`);
    }
    const cityExists = await City.findOne({ name: cityName });
    if (!cityExists) {
      throw new Error(`City '${cityName}' does not exist in the database`);
    }
    const updatedCar = await Car.findOneAndUpdate(
      { name: carName },
      { assignedCity: cityName },
      { new: true }
    );
    return updatedCar;
  }
}

export default new CarController();
