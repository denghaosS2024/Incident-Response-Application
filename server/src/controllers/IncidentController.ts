import { Types } from 'mongoose'
import { ICar } from '../models/Car'
import Incident, { IncidentPriority, type IIncident } from '../models/Incident'
import { ITruck } from '../models/Truck'
import User from '../models/User'
import { ROLES } from '../utils/Roles'
import UserConnections from '../utils/UserConnections'
import CarController from './CarController'
import ChannelController from './ChannelController'
import TruckController from './TruckController'
import UserController from './UserController'

class IncidentController {
    /**
     * Find an incident by its ID
     * @param _id - The MongoDB ObjectId of the incident
     * @returns The incident object if found
     * @throws {Error} if the incident with the given ID is not found
     */
    async findById(_id: Types.ObjectId) {
        const incident = await Incident.findById(_id).exec()
        if (!incident) {
            throw new Error(`Incident with ID '${_id}' not found`)
        }
        return incident
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
                throw new Error(
                    'Incident ID is required for updating an incident.',
                )
            }

            const updatedIncident = await Incident.findOneAndUpdate(
                { incidentId: incident.incidentId },
                { $set: incident },
                { new: true },
            ).exec()

            if (!updatedIncident) {
                throw new Error(
                    `Incident with ID '${incident.incidentId}' not found`,
                )
            }

            return updatedIncident
        } catch (error) {
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

    /**
     * @param commander which is the username of the commander
     * @returns incident details based on commander
     */
    async getIncidentByCommander(commander: string): Promise<IIncident[]> {
        return await Incident.find({ commander: commander }).exec()
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
            _id: string
            name: string
            assignedCity: string
            role: 'Fire' | 'Police'
            assignedVehicleTimestamp?: string | null
            assignedCar?: string
            assignedTruck?: string
            assignedIncident?: string
        },
        commandingIncident: IIncident,
        vehicle: ICar | ITruck,
    ) {
        try {
            console.log(
                'addVehicleToIncident',
                personnel,
                commandingIncident,
                vehicle,
            )
            if (vehicle.assignedIncident) {
                const assignedIncident = await Incident.findOne({
                    incidentId: vehicle.assignedIncident,
                })
                if (!assignedIncident) {
                    throw new Error(
                        `Incident with ID '${vehicle.assignedIncident}' not found`,
                    )
                }
                const existingVehicleIndex =
                    assignedIncident.assignedVehicles.findIndex(
                        (v) => v.name === vehicle.name,
                    )
                if (vehicle.assignedIncident) {
                    if (existingVehicleIndex !== -1) {
                        // Create an update operation to add the username to the specific vehicle's usernames
                        const updateOperation = {
                            $addToSet: {
                                [`assignedVehicles.${existingVehicleIndex}.usernames`]:
                                    personnel.name,
                            },
                        }

                        const updatedIncident: IIncident | null =
                            await Incident.findByIdAndUpdate(
                                assignedIncident._id,
                                updateOperation,
                                { new: true },
                            )
                        return updatedIncident
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
                        ...new Set([
                            ...(vehicle.usernames || []),
                            personnel.name,
                        ]),
                    ]
                    // Create an update operation to add the username to the specific vehicle's usernames
                    const updatedIncident = await Incident.findByIdAndUpdate(
                        commandingIncident._id,
                        {
                            $push: {
                                assignedVehicles: {
                                    type:
                                        personnel.role === 'Police'
                                            ? 'Car'
                                            : 'Truck',
                                    name: vehicle.name,
                                    usernames: allUsers,
                                },
                            },
                        },
                    )
                    return updatedIncident
                }
            }
            return null
        } catch (error) {
            console.error('Error adding vehicle to incident:', error)
            throw error
        }
    }

    async closeIncident(incidentId: string): Promise<IIncident | null> {
        const incident = await Incident.findOne({ incidentId }).exec()
        if (!incident) {
            throw new Error(`Incident with ID '${incidentId}' not found`)
        }

        // Update incident state to 'Closed' and record the closing date/time
        incident.incidentState = 'Closed'
        incident.closingDate = new Date()

        // Un-allocate all resources by updating each assigned vehicle's assignedIncident to null
        for (const vehicle of incident.assignedVehicles) {
            if (vehicle.type === 'Car') {
                await CarController.updateIncident(vehicle.name, null)
            } else if (vehicle.type === 'Truck') {
                await TruckController.updateIncident(vehicle.name, null)
            }
        }

        incident.assignedVehicles = []

        if (incident.incidentCallGroup) {
            await ChannelController.closeChannel(incident.incidentCallGroup)
            incident.incidentCallGroup = null
        }

        if (incident.respondersGroup) {
            await ChannelController.closeChannel(incident.respondersGroup)
            incident.respondersGroup = null
        }

        await incident.save()

        return incident
    }

    async updateVehicleHistory(incident: IIncident): Promise<IIncident | null> {
        const incidentId = incident.incidentId
        const existingIncident = await Incident.findOne({ incidentId }).exec()

        if (!existingIncident) return null
        const currentVehicleKeys = incident.assignedVehicles || []
        const existingVehicleKeys = existingIncident.assignedVehicles || []
        const currentSet = new Set(
            currentVehicleKeys.map((v) => `${v.type}::${v.name}`),
        )
        const previousSet = new Set(
            existingVehicleKeys.map((v) => `${v.type}::${v.name}`),
        )

        const addVehicleSet = currentVehicleKeys.filter(
            (v) => !previousSet.has(`${v.type}::${v.name}`),
        )
        const removeVehicleSet = existingVehicleKeys.filter(
            (v) => !currentSet.has(`${v.type}::${v.name}`),
        )

        const now = new Date()
        existingIncident.assignHistory = existingIncident.assignHistory || []

        for (const v of addVehicleSet) {
            existingIncident.assignHistory.push({
                timestamp: now,
                usernames: v.usernames,
                isAssign: true,
                name: v.name,
                type: v.type,
            })
            if (v.type == 'Car') {
                await CarController.updateIncident(v.name, incidentId)
            } else {
                await TruckController.updateIncident(v.name, incidentId)
            }

            //Notify the first responder
            v.usernames.forEach(async (username) => {
                const user = await User.findOne({ username })
                if (!user) return
                const id = user._id.toHexString()
                if (!UserConnections.isUserConnected(id)) return

                const connection = UserConnections.getUserConnection(id)!
                console.log('emit')
                connection.emit('join-new-incident', incidentId)
            })
        }

        for (const v of removeVehicleSet) {
            existingIncident.assignHistory.push({
                timestamp: now,
                usernames: v.usernames,
                isAssign: false,
                name: v.name,
                type: v.type,
            })
            if (v.type == 'Car') {
                await CarController.updateIncident(v.name, null)
            } else {
                await TruckController.updateIncident(v.name, null)
            }
        }

        existingIncident.assignedVehicles = currentVehicleKeys

        const exits = await existingIncident.save()

        try {
            const updated = await this.createOrUpdateRespondersGroup(exits)
            console.log(updated)
            return updated
        } catch (e) {
            console.log(e)
            return exits
        }
    }

    async createOrUpdateRespondersGroup(
        incident: IIncident,
    ): Promise<IIncident> {
        if (
            !incident.assignedVehicles ||
            incident.assignedVehicles.length === 0
        ) {
            throw new Error(
                'No assigned vehicles available to create responders group.',
            )
        }

        const isCommanderOnVehicle = incident.assignedVehicles.some((vehicle) =>
            vehicle.usernames.includes(incident.commander),
        )
        if (!isCommanderOnVehicle) {
            throw new Error('Commander must be present on one of the vehicles')
        }

        const respondersSet = new Set<string>()
        incident.assignedVehicles.forEach((vehicle) => {
            vehicle.usernames.forEach((username) => respondersSet.add(username))
        })

        respondersSet.add(incident.commander)
        const respondersUsernames = Array.from(respondersSet)

        const respondersUserIds = await Promise.all(
            respondersUsernames.map(async (username) => {
                const user = await UserController.findUserByUsername(username)
                if (!user) {
                    throw new Error(`User ${username} not found`)
                }
                return user._id
            }),
        )

        const commanderUser = await UserController.findUserByUsername(
            incident.commander,
        )
        if (!commanderUser) {
            throw new Error(`Commander user ${incident.commander} not found`)
        }
        const ownerId = commanderUser._id

        const channelName = `${incident.incidentId}_Resp`

        let channel
        if (incident.respondersGroup) {
            channel = await ChannelController.updateChannel({
                _id: incident.respondersGroup,
                name: channelName,
                userIds: respondersUserIds,
                ownerId: ownerId,
                closed: false,
            })
        } else {
            channel = await ChannelController.create({
                name: channelName,
                userIds: respondersUserIds,
                ownerId: ownerId,
                closed: false,
            })
            incident.respondersGroup = channel._id
        }

        await incident.save()
        const updatedIncident = await Incident.findById(incident._id)
            .populate('respondersGroup')
            .exec()

        if (!updatedIncident) {
            throw new Error(`Incident with ID '${incident._id}' not found`)
        }

        return updatedIncident
    }
}

export default new IncidentController()
