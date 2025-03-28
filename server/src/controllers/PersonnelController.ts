import Car, {ICar} from '../models/Car'
import City from '../models/City'
import Truck, {ITruck} from '../models/Truck'
import User, { IUser } from '../models/User'
import { ROLES } from '../utils/Roles'
import { IIncident } from '../models/Incident'
class PersonnelController {
  /**
   * Get all available personnel (Police and Firefighters) who are not assigned to any city.
   */
  private updateCarAssignment(
    username: string, 
    vehicleName: string, 
    assignedIncidentId?: string | null
  ): Promise<IUser | null> {
    const updateData: Partial<IUser> = {
      assignedCar: vehicleName,
      assignedVehicleTimestamp: new Date()
    };
  
    if (assignedIncidentId !== undefined) {
      updateData.assignedIncident = assignedIncidentId;
    }
  
    return User.findOneAndUpdate(
      { username },
      updateData,
      { new: true }
    );
  }

  private updateTruckAssignment(
    username: string, 
    vehicleName: string, 
    assignedIncidentId?: string | null
  ): Promise<IUser | null> {
    const updateData: Partial<IUser> = {
      assignedTruck: vehicleName,
      assignedVehicleTimestamp: new Date()
    };
  
    if (assignedIncidentId !== undefined) {
      updateData.assignedIncident = assignedIncidentId;
    }
  
    return User.findOneAndUpdate(
      { username },
      updateData,
      { new: true }
    );
  }

  async getPersonnelByName(username: string) {
    try {
      const personnel: IUser | null = await User.findOne({ username: username })
      return personnel
    } catch (error) {
      console.error('Error fetching personnel:', error)
      throw error
    }
  }

  async getAllAvailablePersonnel() {
    try {
      const unassignedUsers = await User.find({
        role: { $in: [ROLES.POLICE, ROLES.FIRE] },
        assignedCity: null,
      })
        .sort({ username: 1 })
        .exec()

      return unassignedUsers.map(({ _id, username, assignedCity }) => ({
        _id,
        name: username,
        assignedCity,
      }))
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
  async updatePersonnelCity(
    username: string,
    cityName: string,
  ): Promise<IUser | null> {
    try {
      if (!cityName) {
        const updatedPersonnel = await User.findOneAndUpdate(
          {
            username,
            role: { $in: [ROLES.POLICE, ROLES.FIRE] },
          },
          { assignedCity: null },
          { new: true },
        )
        return updatedPersonnel
      }
      const cityExists = await City.findOne({ name: cityName })
      if (!cityExists) {
        throw new Error(`City '${cityName}' does not exist in the database`)
      }
      const personnel = await User.findOne({ username })
      if (
        !personnel ||
        (personnel.role !== ROLES.POLICE && personnel.role !== ROLES.FIRE)
      ) {
        throw new Error(`Personnel with username '${username}' does not exist`)
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username },
        { assignedCity: cityName },
        { new: true },
      )
      return updatedPersonnel
    } catch (error) {
      console.error('Error updating personnel city:', error)
      throw error
    }
  }


  async selectVehicleForPersonnel(personnelName: string, commandingIncident: IIncident, vehicle: ICar | ITruck) {
    try{
      if (commandingIncident && vehicle.assignedIncident && commandingIncident.incidentId !== vehicle.assignedIncident) {
        throw new Error(`Cannot select a vehicle from another incident while commanding an incident`);
      }
      const personnel = await User.findOne({ username: personnelName });
      
      if (!personnel) {
        throw new Error(`Personnel with username '${personnelName}' does not exist`);
      }
      const assignedIncidentId = vehicle.assignedIncident;
      let updatedPersonnel: IUser | null;
      if ( personnel.role === ROLES.POLICE) {
        if (assignedIncidentId && !personnel.assignedIncident) {
          updatedPersonnel = await this.updateCarAssignment(personnelName, vehicle.name, vehicle.assignedIncident);
          return updatedPersonnel;
        }
        
        updatedPersonnel = await this.updateCarAssignment(personnelName, vehicle.name);
        return updatedPersonnel;
      } else if (personnel.role === ROLES.FIRE) {
        if (assignedIncidentId && !personnel.assignedIncident) {
          updatedPersonnel = await this.updateTruckAssignment(personnelName, vehicle.name, vehicle.assignedIncident);
          return updatedPersonnel;
        }
        
        updatedPersonnel = await this.updateTruckAssignment(personnelName, vehicle.name);
        return updatedPersonnel;
      }
      throw new Error(`Personnel with username '${personnelName}' is not a police or firefighter`);
    } catch (error) {
      console.error('Error selecting vehicle for personnel:', error);
      throw error;
    }
  }

  // async selectVehicleForPersonnel(personnelName: string, vehicleName: string) {
  //   if (!vehicleName) {
  //     throw new Error('Vehicle name is required')
  //   }
  //   const personnel = await User.findOne({ username: personnelName })
  //   if (!personnel) {
  //     throw new Error(
  //       `Personnel with username '${personnelName}' does not exist`,
  //     )
  //   }

  //   const commandingIncident = await Incident.findOne({ 
  //     commander: personnelName, 
  //     incidentState: { $ne: 'Closed' } 
  //   })

  //   if (personnel.role === ROLES.POLICE) {
  //     const car = await Car.findOne({ name: vehicleName })
  //     if (!car) {
  //       throw new Error(`Car with name '${vehicleName}' does not exist`)
  //     }
  //     const assignedIncident = car.assignedIncident
  //     // Prevent commander of IncidentX select vehicle from IncidentY
  //     if (commandingIncident && assignedIncident && assignedIncident !== commandingIncident.incidentId) {
  //       throw new Error(`Cannot select a vehicle from another incident while commanding an incident`)
  //     }
  //     // Add the current first responder to the incident the vehicle is assigned to
  //     if (assignedIncident && !personnel.assignedIncident ){
  //       await Incident.findByIdAndUpdate(assignedIncident, {
  //         $addToSet: { assignedVehicles: { 
  //           $elemMatch: { 
  //             type: 'Car', 
  //             name: vehicleName,
  //             usernames: { $ne: personnelName }
  //           }
  //         }}
  //       })
  //     }
  //     // Update the personnel with the vehicle and incident
  //     const updatedPersonnel = await User.findOneAndUpdate(
  //       { username: personnelName },
  //       { assignedCar: vehicleName, assignedVehicleTimestamp: new Date(), assignedIncident: assignedIncident },
  //       { new: true },
  //     )
  //     // If the personnel is a commander and doesn't have a vehicle, automatically assign the vehicle to the incident commanding
  //     if (commandingIncident && !assignedIncident) {
  //       await Incident.findByIdAndUpdate(commandingIncident.incidentId, {
  //         $addToSet: { assignedVehicles: { 
  //           $elemMatch: { 
  //             type: 'Car', 
  //             name: vehicleName,
  //             usernames: { $ne: personnelName }
  //           }
  //         }}
  //       })
  //     }
  //     return updatedPersonnel
  //   } else if (personnel.role === ROLES.FIRE) {
  //     const truck = await Truck.findOne({ name: vehicleName })
  //     if (!truck) {
  //       throw new Error(`Truck with name '${vehicleName}' does not exist`)
  //     }
  //     const updatedPersonnel = await User.findOneAndUpdate(
  //       { username: personnelName },
  //       { assignedTruck: vehicleName, assignedVehicleTimestamp: new Date() },
  //       { new: true },
  //     )
  //     return updatedPersonnel
  //   }

  //   throw new Error(
  //     `Personnel with username '${personnelName}' is not a police or firefighter`,
  //   )
  // }

  async releaseVehicleFromPersonnel(
    personnelName: string,
    vehicleName: string,
  ) {
    const personnel = await User.findOne({ username: personnelName })
    if (!personnel) {
      throw new Error(
        `Personnel with username '${personnelName}' does not exist`,
      )
    }
    if (personnel.role === ROLES.POLICE) {
      const car = await Car.findOne({ name: vehicleName })
      if (!car) {
        throw new Error(`Car with name '${vehicleName}' does not exist`)
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username: personnelName },
        { assignedCar: null, assignedVehicleTimestamp: null },
        { new: true },
      )
      return updatedPersonnel
    } else if (personnel.role === ROLES.FIRE) {
      const truck = await Truck.findOne({ name: vehicleName })
      if (!truck) {
        throw new Error(`Truck with name '${vehicleName}' does not exist`)
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username: personnelName },
        { assignedTruck: null, assignedVehicleTimestamp: null },
        { new: true },
      )
      return updatedPersonnel
    }
    throw new Error(
      `Personnel with username '${personnelName}' is not a police or firefighter`,
    )
  }
}

export default new PersonnelController()
