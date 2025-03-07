import Incident, { IncidentPriority, type IIncident } from "../models/Incident"
import { Types } from 'mongoose';

class IncidentController {
    /**
     * Create a new incident
     * @param username - The username of the 911 Caller
     * @returns The newly created incident object
     * @throws {Error} if the incident already exists --> in the future check if the incident exists and is not closed
     */
    async create(
        username: string,
    ) {
        // Check if the incident already exists
        let incidentId = `I${username}`
        let incident = await Incident.findOne({ incidentId }).exec()

        if (incident) {
            throw new Error(`Incident "${incidentId}" already exists`)
        } else {
            // Create and save new incident object
            incident = await new Incident({
                incidentId,
                caller: username,
                openingDate: new Date(),
                incidentState: "Waiting",
                owner: "System",
                commander: "System",
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
    async createIncident(
        incident: IIncident,
    ) {

        // Check if the incident already exists
        let incidentId = `I${incident.caller}`
        let existingIncident = await Incident.findOne({ incidentId }).exec()

        if (existingIncident) {
            throw new Error(`Incident "${incidentId}" already exists`)
        } else {
            // Create and save new incident object
            incident = await new Incident({
                incidentId:`I${incident.caller}`,
                caller: incident.caller,
                openingDate: new Date(),
                incidentState: incident.incidentState ? incident.incidentState : "Waiting",
                owner: incident.owner ? incident.owner : "System",
                address: incident.address ? incident.address : "" ,
                type: incident.type ? incident.type : "",
                questions: incident.questions ? incident.questions : {},
                priority: IncidentPriority.Immediate,
                incidentCallGroup: incident.incidentCallGroup ? incident.incidentCallGroup : null,
            }).save()
        }
        return incident
    }

    

    /**
     * Update incident chat group
     * @param id - The _id of the incident to update
     * @param channelId - The MongoDB ObjectId of the chat channel
     * @returns The updated incident if found, null otherwise
     */
    async updateChatGroup(
        id: Types.ObjectId, 
        channelId: Types.ObjectId
    ) : Promise<IIncident | null> {
        // Convert string id to MongoDB ObjectId
        const _id = id;
        return Incident.findOneAndUpdate(
            { _id },
            { incidentCallGroup: channelId },
            { new: true }
        ).exec();
    }

    /**
     * Get active incident for a user
     * @param username - The username of the caller
     * @returns The active incident if found, null otherwise
     */
    async getActiveIncident(
        username: string
    ): Promise<IIncident | null> {
        return Incident.findOne({
            caller: username,
            incidentState: { $ne: 'Closed' }
        })
        .exec();
    }

    /**
     * Get all incidents
     * @returns All incidents
     */
    async getAllIncidents(): Promise<IIncident[]> {
        return Incident.find().exec()
    }

}

export default new IncidentController()