import City, { ICity } from "../models/City";


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
    const city: ICity = new City({ name: name.trim() });
    return city.save();
  }

  /**
   * Removes a city by its ID
   * @param id The MongoDB document ID of the city
   * @returns The removed city document
   */
  async removeCityById(id: string) {
    const deleted = await City.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("City not found");
    }
    return deleted;
  }
}

export default new CityController();
