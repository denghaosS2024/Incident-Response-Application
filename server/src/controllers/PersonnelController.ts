import Personnel, { IPersonnel } from "../models/Personnel";

class PersonnelController {
  /**
   * Get all personnel
   */
  async getAllPersonnel(): Promise<IPersonnel[]> {  
    return await Personnel.find().sort({ name: 1 }).exec();
  }

  /**
   * Create a new personnel entry
   */
  async createPersonnel(name: string, role: string): Promise<IPersonnel> {
    if (!name.trim() || !role.trim()) {
      throw new Error("Both name and role are required.");
    }
    const personnel = new Personnel({ name: name.trim(), role: role.trim() });
    return await personnel.save();
  }

  /**
   * Remove personnel by ID
   */
  async removePersonnelById(id: string): Promise<IPersonnel | null> {
    return await Personnel.findByIdAndDelete(id);
  }
}

export default new PersonnelController();
