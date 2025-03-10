import City from "../models/City";
import User, { IUser } from "../models/User";
import { ROLES } from "../utils/Roles";

class PersonnelController {
  /**
   * Get all available personnel (Police and Firefighters) who are not assigned to any city.
   */
  async getAllAvailablePersonnel(): Promise<IUser[]> {  
    try {
      const unassignedUsers = await User.find({
        role: { $in: [ROLES.POLICE, ROLES.FIRE] },
        assignedCity: null,
      }).sort({ username: 1 }).exec();
  
      return unassignedUsers
    } catch (error) {
      console.error('Error fetching unassigned users:', error)
      throw error
    }
  }

  /**
   * Update the assigned city for a specific personnel.
   * @param username - The username of the personnel to update.
   * @param cityName - The name of the city to assign.
   * @returns The updated personnel object.
   */
  async updatePersonnelCity(username: string, cityName: string): Promise<IUser | null> {
    try {
      if (!cityName) {
        const updatedPersonnel = await User.findOneAndUpdate(
          {
            username,
            role: { $in: [ROLES.POLICE, ROLES.FIRE] },
          },
          { assignedCity: null },
          { new: true }
        )
        return updatedPersonnel
      }
      const cityExists = await City.findOne({ name: cityName })
      if (!cityExists) {
        throw new Error(`City '${cityName}' does not exist in the database`)
      }
      const personnel = await User.findOne({ username })
      if (!personnel || (personnel.role !== ROLES.POLICE && personnel.role !== ROLES.FIRE)) {
        throw new Error(`Personnel with username '${username}' does not exist`)
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username }, { assignedCity: cityName })
      return updatedPersonnel
    } catch (error) {
      console.error('Error updating personnel city:', error)
      throw error
    }
  }
}

export default new PersonnelController();
