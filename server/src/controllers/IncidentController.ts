import Incident from "../models/Incident"

class IncidentController {
    /**
     * Create a new incident
     * @param username - The username of the 911 Caller
     * @returns The newly created incident object
     * @throws Error if the incident already exists --> in the future check if the incident exists and is not closed
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

}

export default new IncidentController()