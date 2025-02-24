import Incident, { type IIncident }from "../models/Incident"
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
     * Update incident chat group
     * @param incidentId - The ID of the incident to update
     * @param channelId - The MongoDB ObjectId of the chat channel
     * @returns The updated incident if found, null otherwise
     */
    async updateChatGroup(
        incidentId: string, 
        channelId: Types.ObjectId
    ) : Promise<IIncident | null> {
        return Incident.findOneAndUpdate(
            { incidentId },
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
        .populate('incidentCallGroup')
        .exec();
    }

}

export default new IncidentController()