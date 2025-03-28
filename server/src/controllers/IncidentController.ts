import { Types } from 'mongoose'
import Incident, { IncidentPriority, type IIncident } from '../models/Incident'
import { ROLES } from '../utils/Roles'
import UserConnections from '../utils/UserConnections'
import {ICar} from '../models/Car'
import {ITruck} from '../models/Truck'
import {IUser} from '../models/User'

class IncidentController {
  /**
   * Create a new incident
   * @param username - The username of the 911 Caller
   * @returns The newly created incident object
   * @throws {Error} if the incident already exists --> in the future check if the incident exists and is not closed
   */
  async create(username: string) {
    // Check if the incident already exists
    const incidentId = `I${username}`
    let incident = await Incident.findOne({ incidentId }).exec()

    if (incident) {
      throw new Error(`Incident "${incidentId}" already exists`)
    } else {
      // Create and save new incident object
      incident = await new Incident({
        incidentId,
        caller: username,
        openingDate: new Date(),
        incidentState: 'Waiting',
        owner: 'System',
        commander: 'System',
      }).save()
    }
    return incident
  }

  /**
   * Create a new incident with existing information
   * @param incident
   * @returns The newly created incident object
   * @throws {Error} if the incident already exists --> in the future check if the incident exists and is not closed
   */
  async createIncident(incident: IIncident) {
    // Check if the incident already exists
    const incidentId = `I${incident.caller}`
    const existingIncident = await Incident.findOne({ incidentId }).exec()

    if (existingIncident) {
      // TO-DO: Don't throw an error, update the existing incident or return existing incident or return a flag so that the route can use HTTP status code to tell frontend
      // The Error will always result an 400 http code to frontend
      return existingIncident
      // throw new Error(`Incident "${incidentId}" already exists`)
    } else {
      // Create and save new incident object
      incident = await new Incident({
        incidentId: incident.incidentId
          ? incident.incidentId
          : `I${incident.caller}`,
        caller: incident.caller,
        openingDate: new Date(),
        incidentState: incident.incidentState
          ? incident.incidentState
          : 'Waiting',
        owner: incident.owner ? incident.owner : 'System',
        commander: incident.commander ? incident.commander : 'System',
        address: incident.address ? incident.address : '',
        type: incident.type ? incident.type : 'U',
        questions: incident.questions ? incident.questions : {},
        priority: IncidentPriority.Immediate,
        incidentCallGroup: incident.incidentCallGroup
          ? incident.incidentCallGroup
          : null,
      }).save()

      const notifyDispatchers = async (
        username: string,
        incidentId: string,
      ) => {
        UserConnections.broadcaseToRole(
          ROLES.DISPATCH,
          'new-incident-created',
          {
            username,
            incidentId,
            message: `New incident ${incidentId} created by ${username}`,
          },
        )
        console.log(
          `New incident ${incidentId} created by ${username}, message sent to dispatchers`,
        )
      }

      await notifyDispatchers(incident.incidentId, incident.caller)
      return incident
    }
  }

  /**
   * Update incident chat group
   * @param id - The _id of the incident to update
   * @param channelId - The MongoDB ObjectId of the chat channel
   * @returns The updated incident if found, null otherwise
   */
  async updateChatGroup(
    id: Types.ObjectId,
    channelId: Types.ObjectId,
  ): Promise<IIncident | null> {
    // Convert string id to MongoDB ObjectId
    const _id = id
    return Incident.findOneAndUpdate(
      { _id },
      { incidentCallGroup: channelId },
      { new: true },
    ).exec()
  }

  /**
   * Get active incident for a user
   * @param username - The username of the caller
   * @returns The active incident if found, null otherwise
   */
  async getActiveIncident(username: string): Promise<IIncident | null> {
    return Incident.findOne({
      caller: username,
      incidentState: { $ne: 'Closed' },
    }).exec()
  }

  /**
   * Updates an existing incident based on incidentId
   * @param incident which is a partial IIncident which may or may not contain all the fields in the IIncident object
   * @returns The updated incident object or null if the indicent with the incidentId is not found in collection
   * @throws {Error} If the incident Id is missing
   */
  async updateIncident(
    incident: Partial<IIncident>,
  ): Promise<IIncident | null> {
    try {
      if (!incident.incidentId) {
        throw new Error('Incident ID is required for updating an incident.')
      }

      const updatedIncident = await Incident.findOneAndUpdate(
        { incidentId: incident.incidentId },
        { $set: incident },
        { new: true },
      ).exec()

      return updatedIncident
    } catch (error) {
      console.error('Error updating incident:', error)
      throw error
    }
  }

  /**
   * Get all incidents
   * @returns All incidents
   */
  async getAllIncidents(): Promise<IIncident[]> {
    try {
      return await Incident.find().exec()
    } catch (error) {
      // MongoDB error
      throw new Error(`Database Error: ${error}`)
    }
  }

  /**
   * Get all incidents created by a particular user. Although citizens can create only 1 incident, responders can create more than one
   * @returns All incidents created by a particular user
   */
  async getIncidentsByCaller(caller: string): Promise<IIncident[]> {
    return await Incident.find({ caller }).exec()
  }

  /**
   * Get incident details based on incidentId
   * @returns incident details based on incidentId
   */
  async getIncidentByIncidentId(incidentId: string): Promise<IIncident[]> {
    return await Incident.find({ incidentId }).exec()
  }

  /**
   * Get incident details based on channelId
   * @returns incident details based on channelId
   */
  async getIncidentByChannelId(channelId: string): Promise<IIncident[]> {
    const incidentCallGroup = channelId
    return await Incident.find({ incidentCallGroup }).exec()
  }

  async getIncidentByCommander(commander: string): Promise<IIncident[]> {
    return await Incident.find({ commander: commander }).exec()
  }

  async addVehicleToIncident(personnel:IUser, commandingIncident:IIncident, vehicle: ICar | ITruck){
    try{
      if (vehicle.assignedIncident){
        const assignedIncident = await Incident.findOne({ incidentId: vehicle.assignedIncident });
        if (!assignedIncident) {
          throw new Error(`Incident with ID '${vehicle.assignedIncident}' not found`);
        }
        const existingVehicleIndex = assignedIncident.assignedVehicles.findIndex(
          vehicle => vehicle.name === vehicle.name 
        );
        if (vehicle.assignedIncident && !personnel.assignedIncident) {
          if (existingVehicleIndex !== -1) {
            // Create an update operation to add the username to the specific vehicle's usernames
            const updateOperation = {
              $addToSet: { 
                [`assignedVehicles.${existingVehicleIndex}.usernames`]: personnel.username 
              }
            };
          
            const updatedIncident: IIncident | null = await Incident.findByIdAndUpdate(assignedIncident._id, updateOperation, { new: true });
            return updatedIncident;
          }
        }
      } else {
        if (commandingIncident && !vehicle.assignedIncident && (!personnel.assignedCar && !personnel.assignedTruck)) {
          // Create an update operation to add the username to the specific vehicle's usernames
          const updatedIncident = await Incident.findByIdAndUpdate(commandingIncident._id, {
            $push: { 
              assignedVehicles: { 
                type: personnel.role === 'Police' ? 'Car' : 'Truck',
                name: vehicle.name,
                usernames: vehicle.usernames
              }
            }
          })
          return updatedIncident;
        }
      }
      return null;
    } catch (error) {
      console.error('Error adding vehicle to incident:', error);
      throw error;
    }
  }


  async closeIncident(incidentId: string): Promise<IIncident | null> {
    return await Incident.findOneAndUpdate(
      { incidentId },
      { $set: { incidentState: 'Closed' } },
      { new: true },
    ).exec()
  }
}


export default new IncidentController()
