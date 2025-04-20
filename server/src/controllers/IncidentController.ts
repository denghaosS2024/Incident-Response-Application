import { Types } from "mongoose";
import { ICar } from "../models/Car";
import Incident, {
  IncidentPriority,
  IncidentState,
  type IIncident,
} from "../models/Incident";
import { ITruck } from "../models/Truck";
import User, { IUser } from "../models/User";
import { ROLES } from "../utils/Roles";
import UserConnections from "../utils/UserConnections";
import CarController from "./CarController";
import ChannelController from "./ChannelController";
import TruckController from "./TruckController";
import UserController from "./UserController";
async function getCommanderRole(commander: string): Promise<string> {
  try {
    const commanderUser = await User.findOne({ username: commander }).exec();
    console.log(commander, commanderUser);
    return commanderUser?.role || "Unknown";
  } catch (error) {
    console.error(`Error retrieving role for commander ${commander}:`, error);
    return "Unknown";
  }
}
class IncidentController {
  /**
   * Find an incident by its ID
   * @param _id - The MongoDB ObjectId of the incident
   * @returns The incident object if found
   * @throws {Error} if the incident with the given ID is not found
   */
  async findById(_id: Types.ObjectId) {
    const incident = await Incident.findById(_id).exec();
    if (!incident) {
      throw new Error(`Incident with ID '${_id}' not found`);
    }
    return incident;
    // throw new Error('Method not implemented.')
  }
  /**
   * Create a new incident
   * @param username - The username of the 911 Caller
   * @returns The newly created incident object
   * @throws {Error} if the incident already exists --> in the future check if the incident exists and is not closed
   */
  async create(username: string) {
    // Check if the incident already exists
    const incidentId = `I${username}`;
    let incident = await Incident.findOne({ incidentId }).exec();

    if (incident) {
      throw new Error(`Incident "${incidentId}" already exists`);
    } else {
      // Create and save new incident object
      incident = await new Incident({
        incidentId,
        caller: username,
        openingDate: new Date(),
        incidentState: "Waiting",
        owner: "System",
        commander: "System",
      }).save();
    }
    return incident;
  }

  /**
   * Create a new incident with existing information
   * @param incident
   * @returns The newly created incident object
   * @throws {Error} if the incident already exists --> in the future check if the incident exists and is not closed
   */
  async createIncident(incident: IIncident) {
    // Check if the incident already exists
    const existingIncident = await Incident.findOne({
      incidentId: incident.incidentId,
    });
    if (existingIncident) {
      // TO-DO: Don't throw an error, update the existing incident or return existing incident or return a flag so that the route can use HTTP status code to tell frontend
      // The Error will always result an 400 http code to frontend
      return existingIncident;
      // throw new Error(`Incident "${incidentId}" already exists`)
    } else {
      // Create and save new incident object
      incident = await new Incident({
        incidentId: incident.incidentId
          ? incident.incidentId
          : `I${incident.caller}`,
        caller: incident.caller,
        city: incident.city ? incident.city : "",
        openingDate: new Date(),
        incidentState: incident.incidentState
          ? incident.incidentState
          : "Waiting",
        owner: incident.owner ? incident.owner : "System",
        commander: incident.commander ? incident.commander : "System",
        address: incident.address ? incident.address : "",
        type: incident.type ? incident.type : "U",
        questions: incident.questions ? incident.questions : {},
        priority: IncidentPriority.Immediate,
        incidentCallGroup: incident.incidentCallGroup
          ? incident.incidentCallGroup
          : null,
        sarTasks: [],
        patients: [],
      }).save();

      if (incident.commander !== "System") {
        const commander = await UserController.getUserByUsername(
          incident.commander,
        );
        if (!commander) {
          throw new Error(`Commander ${incident.commander} not found`);
        }
        if (commander.role === ROLES.FIRE) {
          if (commander.assignedTruck) {
            const truck = await TruckController.getTruckByName(
              commander.assignedTruck,
            );
            if (truck) {
              await TruckController.updateIncident(
                truck.name,
                incident.incidentId,
              );
              incident.assignedVehicles.push({
                type: "Truck",
                name: truck.name,
                usernames: truck.usernames
                  ? truck.usernames
                  : [incident.commander],
              });
              await incident.save();
            }
          }
        } else if (commander.role === ROLES.POLICE) {
          if (commander.assignedCar) {
            const car = await CarController.getCarByName(commander.assignedCar);
            if (car) {
              await CarController.updateIncident(car.name, incident.incidentId);
              incident.assignedVehicles.push({
                type: "Car",
                name: car.name,
                usernames: car.usernames ? car.usernames : [incident.commander],
              });
              await incident.save();
            }
          }
        }
      }

      const notifyDispatchers = async (
        username: string,
        incidentId: string,
      ) => {
        UserConnections.broadcaseToRole(
          ROLES.DISPATCH,
          "new-incident-created",
          {
            incidentId,
            username,
            message: `New incident ${incidentId} created by ${username}`,
          },
        );
        console.log(
          `New incident ${incidentId} created by ${username}, message sent to dispatchers`,
        );
      };

      if (incident.caller) {
        await notifyDispatchers(incident.incidentId, incident.caller);
      } else {
        await notifyDispatchers(incident.incidentId, incident.owner);
      }

      return incident;
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
    const _id = id;
    const incident = await Incident.findById(_id);
    if (!incident) {
      return null;
    }
    // Check if the incident already has a chat group
    if (incident.incidentCallGroup) {
      throw new Error(`Incident with ID '${_id}' already has a chat group`);
    }
    incident.incidentCallGroup = channelId;
    await incident.save();
    return incident;
  }

  /**
   * Get active incident for a user
   * @param username - The username of the caller
   * @returns The active incident if found, null otherwise
   */
  async getActiveIncident(username: string): Promise<IIncident | null> {
    return Incident.findOne({
      caller: username,
      incidentState: { $ne: "Closed" },
    }).exec();
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
        throw new Error("Incident ID is required for updating an incident.");
      }
      const existingIncident = await Incident.findOne({
        incidentId: incident.incidentId,
      }).exec();
      if (!existingIncident) {
        throw new Error(`Incident with ID '${incident.incidentId}' not found`);
      }
      if (
        incident.incidentState &&
        incident.incidentState !== existingIncident.incidentState
      ) {
        const now = new Date();
        const role = await getCommanderRole(
          incident.commander || existingIncident.commander,
        );
        const stateHistoryEntry = {
          timestamp: now,
          commander: incident.commander || existingIncident.commander,
          incidentState: incident.incidentState,
          role: role,
        };
        console.log("this is exist" + existingIncident);
        console.log("history", stateHistoryEntry);
        existingIncident.incidentStateHistory =
          existingIncident.incidentStateHistory || [];
        existingIncident.incidentStateHistory.push(stateHistoryEntry);
        console.log("this is exist" + existingIncident);
      }
      if (incident.incidentStateHistory === undefined) {
        incident.incidentStateHistory = existingIncident.incidentStateHistory;
      }
      const updateFields = { ...incident };
      delete updateFields.incidentStateHistory;
      const updatedIncident = await Incident.findOneAndUpdate(
        { incidentId: incident.incidentId },
        {
          $set: updateFields,
          $push: {
            incidentStateHistory: {
              $each: existingIncident.incidentStateHistory,
            },
          },
        },
        { new: true },
      ).exec();

      // Object.assign(existingIncident, incident)
      // const updatedIncident = await existingIncident.save()
      // console.log('update', updatedIncident)
      return updatedIncident;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all incidents
   * @returns All incidents
   */
  async getAllIncidents(): Promise<IIncident[]> {
    try {
      const incidents = await Incident.find().lean().exec();

      const enriched = await Promise.all(
        incidents.map(async (incident) => {
          const commanderDetail = await UserController.getUserByUsername(
            incident.commander,
          );

          const enrichedAssignHistory = await Promise.all(
            (incident.assignHistory || []).map(async (entry) => {
              let user: IUser | null = null;
              if (entry.usernames && entry.usernames.length > 0) {
                user = await UserController.getUserByUsername(
                  entry.usernames[0],
                );
              }
              return {
                ...entry,
                user: user ?? null,
              };
            }),
          );

          return {
            ...incident,
            commanderDetail,
            assignHistory: enrichedAssignHistory,
          } as IIncident;
        }),
      );

      return enriched;
    } catch (error) {
      // MongoDB error
      throw new Error(`Database Error: ${error}`);
    }
  }

  /**
   * Get all incidents created by a particular user. Although citizens can create only 1 incident, responders can create more than one
   * @returns All incidents created by a particular user
   */
  async getIncidentsByCaller(caller: string): Promise<IIncident[]> {
    return await Incident.find({ caller }).exec();
  }

  /**
   * Get incident by incidentId
   * @param incidentId - The incident ID
   * @returns The incident if found, empty array otherwise
   */
  async getIncidentByIncidentId(incidentId: string): Promise<IIncident[]> {
    try {
      const incidents = await Incident.find({ incidentId }).lean().exec();

      const enriched = await Promise.all(
        incidents.map(async (incident) => {
          const commanderDetail = await UserController.getUserByUsername(
            incident.commander,
          );

          const enrichedAssignHistory = await Promise.all(
            (incident.assignHistory || []).map(async (entry) => {
              let user: IUser | null = null;
              if (entry.usernames && entry.usernames.length > 0) {
                user = await UserController.getUserByUsername(
                  entry.usernames[0],
                );
              }
              return {
                ...entry,
                user: user ?? null,
              };
            }),
          );

          return {
            ...incident,
            commanderDetail,
            assignHistory: enrichedAssignHistory,
          } as IIncident;
        }),
      );

      return enriched;
    } catch (error) {
      console.error("Error getting incident by incidentId:", error);
      return [];
    }
  }

  /**
   * Get incident details based on channelId
   * @returns incident details based on channelId
   */
  async getIncidentByChannelId(channelId: string): Promise<IIncident[]> {
    const respondersGroup = channelId;
    return await Incident.find({ respondersGroup }).exec();
  }

  /**
   * @param commander which is the username of the commander
   * @returns incident details based on commander
   */
  async getIncidentByCommander(commander: string): Promise<IIncident[]> {
    return await Incident.find({ commander: commander }).exec();
  }

  /**
   * Get incident details based on incidentState
   * @param incidentState
   * @returns incident details based on incidentState
   */
  async getIncidentByIncidentState(
    incidentState: string,
  ): Promise<IIncident[]> {
    return await Incident.find({ incidentState: incidentState }).exec();
  }

  /**
   *
   * @param personnel which is the user object
   * @param commandingIncident which is the incident commanding by the user
   * @param vehicle which is the vehicle selected
   * @returns updated incident details
   */
  async addVehicleToIncident(
    personnel: {
      _id: string;
      name: string;
      assignedCity: string;
      role: "Fire" | "Police";
      assignedVehicleTimestamp?: string | null;
      assignedCar?: string;
      assignedTruck?: string;
      assignedIncident?: string;
    },
    commandingIncident: IIncident,
    vehicle: ICar | ITruck,
  ) {
    try {
      console.log(
        "addVehicleToIncident",
        personnel,
        commandingIncident,
        vehicle,
      );
      if (vehicle.assignedIncident) {
        const assignedIncident = await Incident.findOne({
          incidentId: vehicle.assignedIncident,
        });
        if (!assignedIncident) {
          throw new Error(
            `Incident with ID '${vehicle.assignedIncident}' not found`,
          );
        }
        const existingVehicleIndex =
          assignedIncident.assignedVehicles.findIndex(
            (v) => v.name === vehicle.name,
          );
        if (vehicle.assignedIncident) {
          if (existingVehicleIndex !== -1) {
            // Create an update operation to add the username to the specific vehicle's usernames
            const updateOperation = {
              $addToSet: {
                [`assignedVehicles.${existingVehicleIndex}.usernames`]:
                  personnel.name,
              },
            };

            const updatedIncident: IIncident | null =
              await Incident.findByIdAndUpdate(
                assignedIncident._id,
                updateOperation,
                { new: true },
              );
            return updatedIncident;
          }
        }
      } else {
        if (
          commandingIncident &&
          !vehicle.assignedIncident &&
          !personnel.assignedCar &&
          !personnel.assignedTruck
        ) {
          const allUsers = [
            ...new Set([...(vehicle.usernames || []), personnel.name]),
          ];
          // Create an update operation to add the username to the specific vehicle's usernames
          const updatedIncident = await Incident.findByIdAndUpdate(
            commandingIncident._id,
            {
              $push: {
                assignedVehicles: {
                  type: personnel.role === "Police" ? "Car" : "Truck",
                  name: vehicle.name,
                  usernames: allUsers,
                },
              },
            },
          );
          return updatedIncident;
        }
      }
      return null;
    } catch (error) {
      console.error("Error adding vehicle to incident:", error);
      throw error;
    }
  }

  async closeIncident(incidentId: string): Promise<IIncident | null> {
    const incident = await Incident.findOne({ incidentId }).exec();
    if (!incident) {
      throw new Error(`Incident with ID '${incidentId}' not found`);
    }

    // Update incident state to 'Closed' and record the closing date/time
    incident.incidentState = IncidentState.Closed;
    incident.closingDate = new Date();

    // Un-allocate all resources by updating each assigned vehicle's assignedIncident to null
    for (const vehicle of incident.assignedVehicles) {
      if (vehicle.type === "Car") {
        await CarController.updateIncident(vehicle.name, null);
      } else if (vehicle.type === "Truck") {
        await TruckController.updateIncident(vehicle.name, null);
      }
    }

    incident.assignedVehicles = [];

    if (incident.incidentCallGroup) {
      await ChannelController.closeChannel(incident.incidentCallGroup);
    }

    if (incident.respondersGroup) {
      await ChannelController.closeChannel(incident.respondersGroup);
    }

    await incident.save();

    return incident;
  }

  async updateVehicleHistory(incident: IIncident): Promise<IIncident | null> {
    const incidentId = incident.incidentId;
    const existingIncident = await Incident.findOne({ incidentId }).exec();

    if (!existingIncident) return null;
    const currentVehicleKeys = incident.assignedVehicles || [];
    const existingVehicleKeys = existingIncident.assignedVehicles || [];
    const currentSet = new Set(
      currentVehicleKeys.map((v) => `${v.type}::${v.name}`),
    );
    const previousSet = new Set(
      existingVehicleKeys.map((v) => `${v.type}::${v.name}`),
    );

    const addVehicleSet = currentVehicleKeys.filter(
      (v) => !previousSet.has(`${v.type}::${v.name}`),
    );
    const removeVehicleSet = existingVehicleKeys.filter(
      (v) => !currentSet.has(`${v.type}::${v.name}`),
    );

    const now = new Date();
    existingIncident.assignHistory = existingIncident.assignHistory || [];

    for (const v of addVehicleSet) {
      existingIncident.assignHistory.push({
        timestamp: now,
        usernames: v.usernames,
        isAssign: true,
        name: v.name,
        type: v.type,
      });
      if (v.type == "Car") {
        await CarController.updateIncident(v.name, incidentId);
      } else {
        await TruckController.updateIncident(v.name, incidentId);
      }

      //Notify the first responder
      v.usernames.forEach(async (username) => {
        const user = await User.findOne({ username });
        if (!user) return;
        const id = user._id.toHexString();
        if (!UserConnections.isUserConnected(id)) return;

        const connection = UserConnections.getUserConnection(id)!;
        console.log("emit");
        connection.emit("join-new-incident", incidentId);
      });
    }

    for (const v of removeVehicleSet) {
      // check whether incident.commander is in the vehicle
      const isCommanderInVehicle = v.usernames.includes(
        existingIncident.commander,
      );
      if (isCommanderInVehicle) {
        throw new Error("Cannot deallocate commander's vehicle");
      }
      existingIncident.assignHistory.push({
        timestamp: now,
        usernames: v.usernames,
        isAssign: false,
        name: v.name,
        type: v.type,
      });
      if (v.type == "Car") {
        await CarController.updateIncident(v.name, null);
      } else {
        await TruckController.updateIncident(v.name, null);
      }
    }

    existingIncident.assignedVehicles = currentVehicleKeys;

    const exits = await existingIncident.save();

    try {
      const updated = await this.createOrUpdateRespondersGroup(exits);
      console.log(updated);
      return updated;
    } catch (e) {
      console.log(e);
      return exits;
    }
  }

  async createOrUpdateRespondersGroup(
    incidentObj: IIncident,
  ): Promise<IIncident> {
    const incident = await Incident.findById(incidentObj._id).exec();
    if (!incident) {
      throw new Error(`Incident with ID '${incidentObj._id}' not found`);
    }

    if (!incident.assignedVehicles || incident.assignedVehicles.length === 0) {
      if (!incident.respondersGroup) {
        return incident;
      }

      await ChannelController.closeChannel(incident.respondersGroup);
      incident.respondersGroup = null;
      await incident.save();

      const updatedIncident = await Incident.findById(incident._id)
        .populate("respondersGroup")
        .exec();

      if (!updatedIncident) {
        throw new Error(`Incident with ID '${incident._id}' not found`);
      }

      return updatedIncident;
    }

    const isCommanderOnVehicle = incident.assignedVehicles.some((vehicle) =>
      vehicle.usernames.includes(incident.commander),
    );
    if (!isCommanderOnVehicle) {
      throw new Error("Commander must be present on one of the vehicles");
    }

    const respondersSet = new Set<string>();
    incident.assignedVehicles.forEach((vehicle) => {
      vehicle.usernames.forEach((username) => respondersSet.add(username));
    });

    respondersSet.add(incident.commander);
    const respondersUsernames = Array.from(respondersSet);

    const respondersUserIds = await Promise.all(
      respondersUsernames.map(async (username) => {
        const user = await UserController.findUserByUsername(username);
        if (!user) {
          throw new Error(`User ${username} not found`);
        }
        return user._id;
      }),
    );

    const commanderUser = await UserController.findUserByUsername(
      incident.commander,
    );
    if (!commanderUser) {
      throw new Error(`Commander user ${incident.commander} not found`);
    }

    const ownerId = commanderUser._id;
    const channelName = `${incident.incidentId}_Resp`;

    let channel;
    if (incident.respondersGroup) {
      channel = await ChannelController.updateChannel({
        _id: incident.respondersGroup,
        name: channelName,
        userIds: respondersUserIds,
        ownerId: ownerId,
        closed: false,
      });
    } else {
      channel = await ChannelController.create({
        name: channelName,
        userIds: respondersUserIds,
        ownerId: ownerId,
        closed: false,
      });
      incident.respondersGroup = channel._id;
    }

    await incident.save();

    const updatedIncident = await Incident.findById(incident._id)
      .populate("respondersGroup")
      .exec();

    if (!updatedIncident) {
      throw new Error(`Incident with ID '${incident._id}' not found`);
    }

    return updatedIncident;
  }

  async getSARIncidentsByOwner(owner: string): Promise<IIncident[]> {
    try {
      return await Incident.find({
        owner: owner,
        type: "S",
      })
        .sort({ openingDate: -1 })
        .exec();
    } catch (error) {
      console.error("Error fetching SAR incidents:", error);
      throw new Error(`Failed to retrieve SAR incidents: ${error}`);
    }
  }

  async getSARIncidentsByCommander(commander: string): Promise<IIncident[]> {
    try {
      return await Incident.find({
        commander: commander,
        type: "S",
      })
        .sort({ openingDate: -1 })
        .exec();
    } catch (error) {
      console.error("Error fetching SAR incidents:", error);
      throw new Error(`Failed to retrieve SAR incidents: ${error}`);
    }
  }

  /**
   * Create or update a SAR task for an incident
   * @param incidentId - ID of the incident
   * @param sarTask - SAR task data
   * @returns Updated incident with the SAR task
   */
  async createOrUpdateSarTask(
    incidentId: string,
    sarTask: {
      state: "Todo" | "InProgress" | "Done";
      location?: string;
      coordinates?: { latitude: number; longitude: number };
      startDate?: Date;
      name?: string;
      description?: string;
      hazards?: string[];
      victims?: number[];
    },
  ): Promise<IIncident | null> {
    try {
      // Find the incident
      const incident = await Incident.findOne({ incidentId }).exec();

      if (!incident) {
        throw new Error(`Incident with ID '${incidentId}' not found`);
      }

      // Create the new SAR task object
      const newSarTask = {
        state: sarTask.state,
        startDate: sarTask.startDate || new Date(),
        name: sarTask.name || "",
        description: sarTask.description || "",
        location: sarTask.location || "",
        coordinates: sarTask.coordinates || null,
        hazards: sarTask.hazards || [],
        victims: sarTask.victims || [0, 0, 0, 0, 0],
        endDate: null,
      };

      // Update the incident with the new SAR task added to the array
      const updatedIncident = await Incident.findOneAndUpdate(
        { incidentId },
        {
          $push: {
            sarTasks: newSarTask,
          },
        },
        { new: true },
      ).exec();

      // SAR Roles Task Update
      UserConnections.broadcaseToRole(ROLES.FIRE, "sar-task-update", {
        incidentId,
        sarTask: newSarTask,
      });
      UserConnections.broadcaseToRole(ROLES.POLICE, "sar-task-update", {
        incidentId,
        sarTask: newSarTask,
      });

      return updatedIncident;
    } catch (error) {
      console.error("Error creating/updating SAR task:", error);
      throw error;
    }
  }

  async updateIncidentState(
    incidentId: string,
    newState: IncidentState,
    commander: string,
  ): Promise<IIncident | null> {
    try {
      const incident = await Incident.findOne({ incidentId }).exec();
      const role = await getCommanderRole(commander);
      if (!incident) {
        throw new Error(`Incident with ID '${incidentId}' not found`);
      }
      const now = new Date();
      const stateHistoryEntry = {
        timestamp: now,
        commander: commander,
        incidentState: newState,
        role: role,
      };

      incident.incidentState = newState;
      incident.incidentStateHistory = incident.incidentStateHistory || [];
      incident.incidentStateHistory.push(stateHistoryEntry);

      await incident.save();
      return incident;
    } catch (error) {
      console.error("Error updating incident state:", error);
      throw error;
    }
  }

  async getIncidentByCityName(cityName: string): Promise<IIncident[]> {
    try {
      const incidents = await Incident.find({ city: cityName }).exec();
      return incidents;
    }
    catch (error) {
      console.error("Error fetching incidents by city name:", error);
      throw new Error(`Failed to retrieve incidents: ${error}`);
    }
  }
}

export default new IncidentController();
