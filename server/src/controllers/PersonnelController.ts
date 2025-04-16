import Car, { ICar } from "../models/Car";
import City from "../models/City";
import Incident, { IIncident } from "../models/Incident";
import Truck, { ITruck } from "../models/Truck";
import User, { IUser } from "../models/User";
import { ROLES } from "../utils/Roles";
class PersonnelController {
  /**
   * Update the assigned Car for a specific personnel.
   * @param username - The username of the personnel to update.
   * @param vehicleName - The name of the vehicle to assign.
   * @param assignedIncidentId - The incidentId to assign the vehicle to.
   * @returns The updated personnel object.
   *
   * */
  private updateCarAssignment(
    username: string,
    vehicleName: string,
    assignedIncidentId?: string | null,
  ): Promise<IUser | null> {
    const updateData: Partial<IUser> = {
      assignedCar: vehicleName,
      assignedVehicleTimestamp: new Date(),
    };

    if (assignedIncidentId !== undefined) {
      updateData.assignedIncident = assignedIncidentId;
    }

    return User.findOneAndUpdate({ username }, updateData, { new: true });
  }

  /**
   * Update the assigned Truck for a specific personnel.
   * @param username - The username of the personnel to update.
   * @param vehicleName - The name of the vehicle to assign.
   * @param assignedIncidentId - The incidentId to assign the vehicle to.
   * @returns The updated personnel object.
   *
   * */
  private updateTruckAssignment(
    username: string,
    vehicleName: string,
    assignedIncidentId?: string | null,
  ): Promise<IUser | null> {
    const updateData: Partial<IUser> = {
      assignedTruck: vehicleName,
      assignedVehicleTimestamp: new Date(),
    };

    if (assignedIncidentId !== undefined) {
      updateData.assignedIncident = assignedIncidentId;
    }

    return User.findOneAndUpdate({ username }, updateData, { new: true });
  }

  /**
   * Get all available personnel (Police and Firefighters) who are not assigned to any city.
   */
  async getAllAvailablePersonnel() {
    try {
      const unassignedUsers = await User.find({
        role: {
          $in: [
            ROLES.POLICE,
            ROLES.FIRE,
            ROLES.CITY_DIRECTOR,
            ROLES.FIRE_CHIEF,
            ROLES.POLICE_CHIEF,
          ],
        },
        assignedCity: null,
      })
        .sort({ username: 1 })
        .exec();

      return unassignedUsers.map(({ _id, username, assignedCity, role }) => ({
        _id,
        name: username,
        assignedCity,
        role,
      }));
    } catch (error) {
      console.error("Error fetching unassigned users:", error);
      throw error;
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
      const personnel = await User.findOne({ username });
      if (
        !personnel ||
        (personnel.role !== ROLES.POLICE &&
          personnel.role !== ROLES.FIRE &&
          personnel.role !== ROLES.CITY_DIRECTOR &&
          personnel.role !== ROLES.FIRE_CHIEF &&
          personnel.role !== ROLES.POLICE_CHIEF)
      ) {
        throw new Error(`Personnel with username '${username}' does not exist`);
      }
      // unassign personnel from city
      if (!cityName) {
        if (personnel.assignedCar) {
          const car = await Car.findOne({
            name: personnel.assignedCar,
          });
          if (car && car.assignedIncident !== null) {
            throw new Error(
              `Cannot unassign personnel '${username}' because their assigned car is currently involved in an incident`,
            );
          }
        }

        if (personnel.assignedTruck) {
          const truck = await Truck.findOne({
            name: personnel.assignedTruck,
          });
          if (truck && truck.assignedIncident !== null) {
            throw new Error(
              `Cannot unassign personnel '${username}' because their assigned truck is currently involved in an incident`,
            );
          }
        }

        const updatedPersonnel = await User.findOneAndUpdate(
          { username },
          { assignedCity: null },
          { new: true },
        );
        return updatedPersonnel;
      }
      // assign personnel to city
      const cityExists = await City.findOne({ name: cityName });
      if (!cityExists) {
        throw new Error(`City '${cityName}' does not exist in the database`);
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username },
        { assignedCity: cityName },
        { new: true },
      );
      return updatedPersonnel;
    } catch (error) {
      console.error("Error updating personnel city:", error);
      throw error;
    }
  }

  /**
   * Assign the vehicle information to the personnel.
   * @param personnelName - The username of the personnel to update.
   * @param commandingIncident - The incident object commanding by the current user.
   * @param vehicle - The vehicle selected.
   * @returns The updated personnel details.
   */
  async selectVehicleForPersonnel(
    personnelName: string,
    commandingIncident: IIncident,
    vehicle: ICar | ITruck,
  ) {
    try {
      if (
        commandingIncident &&
        vehicle.assignedIncident &&
        commandingIncident.incidentId !== vehicle.assignedIncident
      ) {
        throw new Error(
          `Cannot select a vehicle from another incident while commanding an incident`,
        );
      }
      const personnel = await User.findOne({ username: personnelName });

      if (!personnel) {
        throw new Error(
          `Personnel with username '${personnelName}' does not exist`,
        );
      }

      if (personnel.assignedCar || personnel.assignedTruck) {
        throw new Error(
          `Personnel with username '${personnelName}' already has a vehicle assigned`,
        );
      }
      const assignedIncidentId = vehicle.assignedIncident;
      let updatedPersonnel: IUser | null;
      const personnelIncident = await Incident.findOne({
        "assignedVehicles.usernames": personnelName,
      });
      if (personnelIncident) {
        throw new Error(
          `Cannot select a vehicle while you are assigned to an incident`,
        );
      }
      if (personnel.role === ROLES.POLICE) {
        if (assignedIncidentId) {
          updatedPersonnel = await this.updateCarAssignment(
            personnelName,
            vehicle.name,
            vehicle.assignedIncident,
          );
          return updatedPersonnel;
        }

        updatedPersonnel = await this.updateCarAssignment(
          personnelName,
          vehicle.name,
        );
        return updatedPersonnel;
      } else if (personnel.role === ROLES.FIRE) {
        if (assignedIncidentId) {
          updatedPersonnel = await this.updateTruckAssignment(
            personnelName,
            vehicle.name,
            vehicle.assignedIncident,
          );
          return updatedPersonnel;
        }

        updatedPersonnel = await this.updateTruckAssignment(
          personnelName,
          vehicle.name,
        );
        return updatedPersonnel;
      }
      throw new Error(
        `Personnel with username '${personnelName}' is not a police or firefighter`,
      );
    } catch (error) {
      console.error("Error selecting vehicle for personnel:", error);
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
    const personnel = await User.findOne({ username: personnelName });
    if (!personnel) {
      throw new Error(
        `Personnel with username '${personnelName}' does not exist`,
      );
    }
    if (personnel.role === ROLES.POLICE) {
      const car = await Car.findOne({ name: vehicleName });
      if (!car) {
        throw new Error(`Car with name '${vehicleName}' does not exist`);
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username: personnelName },
        { assignedCar: null, assignedVehicleTimestamp: null },
        { new: true },
      );
      return updatedPersonnel;
    } else if (personnel.role === ROLES.FIRE) {
      const truck = await Truck.findOne({ name: vehicleName });
      if (!truck) {
        throw new Error(`Truck with name '${vehicleName}' does not exist`);
      }
      const updatedPersonnel = await User.findOneAndUpdate(
        { username: personnelName },
        { assignedTruck: null, assignedVehicleTimestamp: null },
        { new: true },
      );
      return updatedPersonnel;
    }
    throw new Error(
      `Personnel with username '${personnelName}' is not a police or firefighter`,
    );
  }
}

export default new PersonnelController();
