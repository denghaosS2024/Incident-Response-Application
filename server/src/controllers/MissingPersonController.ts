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

  /**
   * Update an existing missing person record.
   * @param id The ID of the missing person record to update.
   * @param updateData The data to update the record with.
   * @returns The updated missing person record.
   */
  async updateMissingPerson(id: string, updateData: Partial<IMissingPerson>) {
    try {
      const missingPerson = await MissingPerson.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      
      return missingPerson;
    } catch (error) {
      console.error("Error updating missing person:", error);
      throw new Error("Failed to update missing person record");
    }
  }
  
  /**
   * Mark a missing person as found.
   * @param id The ID of the missing person record.
   * @returns The updated missing person record.
   */
  async markAsFound(id: string) {
    try {
      const missingPerson = await MissingPerson.findByIdAndUpdate(
        id,
        { $set: { reportStatus: "closed" } },
        { new: true }
      ).exec();
      
      return missingPerson;
    } catch (error) {
      console.error("Error marking missing person as found:", error);
      throw new Error("Failed to mark missing person as found");
    }
  }
}

export default new MissingPersonController();
