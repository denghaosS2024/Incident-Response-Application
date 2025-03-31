import City from '../models/City'
import Incident, { IIncident } from '../models/Incident'
import Truck, { ITruck } from '../models/Truck'
class TruckController {
    async getAllTrucks() {
        try {
            const cars = await Truck.find({ assignedCity: null })
                .sort({ name: 1 })
                .select('-__v') // Exclude the __v field
                .exec()

            return cars
        } catch (error) {
            console.error('Error fetching cars:', error)
            throw error
        }
    }

    /**
     *
     * @returns {Promise<ITruck[]>} - Returns a promise that resolves to an array of available trucks with responders.
     * @throws {Error} - Throws an error if there is an issue with the database operation.
     * @description This method fetches all trucks that are available (not assigned to an incident) and have a responder assigned.
     * The trucks are sorted by name in ascending order. The method uses the Truck model to query the database and returns the result.
     * The method handles any errors that may occur during the database operation and logs them to the console.
     */
    async getAvailableTrucksWithResponder() {
        try {
            const truck = await Truck.find({
                assignedIncident: null,
                usernames: { $ne: [] },
            })
                .sort({ name: 1 })
                .select('-__v')
                .exec()

            return truck
        } catch (error) {
            console.error('Error fetching truck:', error)
            throw error
        }
    }

    async createTruck(name: string) {
        if (!name.trim()) {
            throw new Error('Truck name is required')
        }
        const existingTruck = await Truck.findOne({ name: name.trim() })
        if (existingTruck) {
            throw new Error(`Truck with name '${name}' already exists`)
        }
        const truck: ITruck = new Truck({ name: name.trim() })
        return truck.save()
    }

    async removeTruckById(id: string) {
        const deleted = await Truck.findByIdAndDelete(id)
        if (!deleted) {
            throw new Error('Truck not found')
        }
        return deleted
    }

    async updateTruckCity(truckName: string, cityName: string) {
        //unassign truck from city
        if (!cityName) {
            const truck = await Truck.findOne({ name: truckName })
            if (!truck) {
                throw new Error(`Truck with name '${truckName}' does not exist`)
            }

            if (truck.assignedIncident !== null) {
                throw new Error(
                    `Cannot unassign truck '${truckName}' because it is currently assigned to an incident`,
                )
            }
            const updatedTruck = await Truck.findOneAndUpdate(
                { name: truckName },
                { assignedCity: null },
                { new: true },
            )
            return updatedTruck
        }
        //assign truck to city
        const truck = await Truck.findOne({ name: truckName })
        if (!truck) {
            throw new Error(`Truck with name '${truckName}' does not exist`)
        }
        const cityExists = await City.findOne({ name: cityName })
        if (!cityExists) {
            throw new Error(`City '${cityName}' does not exist in the database`)
        }
        const updatedTruck = await Truck.findOneAndUpdate(
            { name: truckName },
            { assignedCity: cityName },
            { new: true },
        )
        return updatedTruck
    }

    async addUsernameToTruck(
        truckName: string,
        username: string,
        commandingIncident: IIncident | null,
    ) {
        try {
            const truck: ITruck | null = await Truck.findOne({
                name: truckName,
            })
            if (!truck) {
                throw new Error(`Truck with name '${truckName}' does not exist`)
            }
            if (commandingIncident && !truck.assignedIncident) {
                const updatedTruck = await Truck.findOneAndUpdate(
                    { name: truckName },
                    {
                        $addToSet: { usernames: username },
                        assignedIncident: commandingIncident.incidentId,
                    },
                    { new: true },
                )
                return updatedTruck
            }
            const updatedTruck: ITruck | null = await Truck.findOneAndUpdate(
                { name: truckName },
                { $addToSet: { usernames: username } },
                { new: true },
            )
            return updatedTruck
        } catch (error) {
            console.error('Error adding username to truck:', error)
            throw error
        }
    }

    async releaseUsernameFromTruck(truckName: string, username: string) {
        const truck: ITruck | null = await Truck.findOne({
            name: truckName,
        })
        if (!truck) {
            throw new Error(`Truck with name '${truckName}' does not exist`)
        }
        const updatedTruck: ITruck | null = await Truck.findOneAndUpdate(
            { name: truckName },
            { $pull: { usernames: username } },
            { new: true },
        )

        if (!updatedTruck) {
            throw new Error(`Failed to retrieve / update truck '${truckName}'`)
        }

        if (!updatedTruck.usernames || updatedTruck.usernames.length === 0) {
            await Incident.findOneAndUpdate(
                { 'assignedVehicles.name': truckName },
                {
                    $pull: {
                        assignedVehicles: { name: truckName },
                    },
                },
                { new: true },
            )
        }
        return updatedTruck
    }

    async getTruckByName(name: string) {
        try {
            const truck: ITruck | null = await Truck.findOne({
                name: name,
            })
            if (!truck) {
                throw new Error(`Truck with name '${name}' does not exist`)
            }
            return truck
        } catch (error) {
            console.error('Error fetching car:', error)
            throw error
        }
    }

    async updateIncident(truckName: string, incidentId: string | null) {
        const truck = await Truck.findOne({ name: truckName })
        if (!truck) {
            throw new Error(`Car with name '${truckName}' does not exist`)
        }
        const updatedTruck = await Truck.findOneAndUpdate(
            { name: truckName },
            { assignedIncident: incidentId },
            { new: true },
        )
        return updatedTruck
    }
}

export default new TruckController()
