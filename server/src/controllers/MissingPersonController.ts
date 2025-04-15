import MissingPerson, { IMissingPerson } from "../models/MissingPerson";

class MissingPersonController {
  /**
   * Create a new Missing Person record.
   * @param missingPersonData An object containing the missing person's details.
   * @returns The newly created missing person record.
   */
  async create(missingPersonData: Partial<IMissingPerson>) {
    try {
      const newMissingPerson = new MissingPerson({
        name: missingPersonData.name,
        age: missingPersonData.age,
        weight: missingPersonData.weight,
        height: missingPersonData.height,
        race: missingPersonData.race,
        eyeColor: missingPersonData.eyeColor,
        gender: missingPersonData.gender,
        description: missingPersonData.description,
        dateLastSeen: missingPersonData.dateLastSeen,
        locationLastSeen: missingPersonData.locationLastSeen,
        photo: missingPersonData.photo,
      });
      await newMissingPerson.save();
      return newMissingPerson;
    } catch (error) {
      console.error("Error creating missing person:", error);
      throw new Error("Failed to create missing person record");
    }
  }

  /**
   * Fetch a missing person record by ID.
   * @param id The ID of the missing person record.
   * @returns The missing person record if found, otherwise null.
   */
  async getMissingPersonById(id: string) {
    try {
      const missingPerson = await MissingPerson.findById(id).exec();
      return missingPerson;
    } catch (error) {
      console.error("Error fetching missing person by ID:", error);
      throw new Error("Failed to fetch missing person record");
    }
  }

  /**
   * Fetch all missing person records.
   * @returns An array of missing person records.
   */
  async getAllMissingPersons() {
    try {
      const missingPersons = await MissingPerson.find()
        .sort({ name: 1 })
        .exec();
      return missingPersons;
    } catch (error) {
      console.error("Error fetching missing person records:", error);
      throw new Error("Failed to fetch missing person records");
    }
  }
}

export default new MissingPersonController();
