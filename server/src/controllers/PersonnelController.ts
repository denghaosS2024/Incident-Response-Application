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
      })
  
      return unassignedUsers
    } catch (error) {
      console.error('Error fetching unassigned users:', error)
      throw error
    }
  }

}

export default new PersonnelController();
