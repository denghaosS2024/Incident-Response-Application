import { Query, Types } from 'mongoose'
import ChannelController from '../../src/controllers/ChannelController'
import IncidentController from '../../src/controllers/IncidentController'
import UserController from '../../src/controllers/UserController'
import Car, { ICar } from '../../src/models/Car'
import Incident, {
    IIncident,
    IncidentPriority,
    IncidentState,
    IncidentType,
} from '../../src/models/Incident'
import ROLES from '../../src/utils/Roles'
import * as TestDatabase from '../utils/TestDatabase'

describe('Incident Controller', () => {
    beforeAll(TestDatabase.connect)
    beforeEach(() => jest.clearAllMocks())
    afterEach(async () => {
        jest.restoreAllMocks()
        await Incident.deleteMany({})
    })
    afterAll(TestDatabase.close)

    const createTestIncident = async (username: string) => {
        const rawIncident = new Incident({
            incidentId: `I${username}`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'System',
            commander: 'System',
            incidentCallGroup: null,
            SarTasks: [],
        })

        return rawIncident.save()
    }

    const createTestIncidentwithGroup = async (username: string) => {
        const rawIncident = new Incident({
            incidentId: `I${username}`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'System',
            commander: 'System',
            incidentCallGroup: new Types.ObjectId(),
            respondersGroup: new Types.ObjectId(),
        })

        return rawIncident.save()
    }

    const createTestCar = async (
        carName: string,
        usernames: string[] = [],
        assignedIncident?: string,
    ) => {
        return await Car.create({
            name: carName,
            usernames,
            assignedIncident: assignedIncident ? assignedIncident : null,
            assignedCity: 'TestCity',
        })
    }

    it('will create a new incident', async () => {
        const username: string = 'test-username-1'
        const newIncident = await IncidentController.create(username)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${username}`)
        expect(newIncident.caller).toBe(username)
        expect(newIncident.incidentState).toBe('Waiting')
    })

    // TODO in the future: check if the state is not closed
    // it('will prevent duplicate incidents', async () => {
    //     const username: string = 'test-username-2'
    //     await createTestIncident(username)

    //     await expect(IncidentController.create(username)).rejects.toThrow(
    //         `Incident "I${username}" already exists`,
    //     )
    // })

    it('should return active incident for user', async () => {
        const username = 'test-user-active'
        await createTestIncident(username)

        const result = await IncidentController.getActiveIncident(username)

        expect(result).toBeDefined()
        expect(result?.caller).toBe(username)
        expect(result?.incidentState).not.toBe('Closed')
    })

    it('should return null if no active incident exists', async () => {
        const result =
            await IncidentController.getActiveIncident('non-existent-user')
        expect(result).toBeNull()
    })

    it('should not return closed incidents', async () => {
        const username = 'test-user-closed'
        const incident = await createTestIncident(username)
        await Incident.findByIdAndUpdate(incident._id, {
            incidentState: 'Closed',
        })

        const result = await IncidentController.getActiveIncident(username)
        expect(result).toBeNull()
    })

    it('should update incident with chat group', async () => {
        const username = 'test-user-chat'
        const incident = await createTestIncident(username)
        const channelId = new Types.ObjectId()

        const result = await IncidentController.updateChatGroup(
            incident._id,
            channelId,
        )

        expect(result).toBeDefined()
        expect(result?.incidentCallGroup?.toString()).toBe(channelId.toString())
    })

    it('should have an error if incident not found', async () => {
        const newIncidentID = new Types.ObjectId()
        await IncidentController.updateChatGroup(
            newIncidentID,
            new Types.ObjectId(),
        ).catch((error) => {
            // Handle the error if needed
            // console.error('Error finding incident:', error)
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(
                `Incident with ID '${newIncidentID}' not found`,
            )
        })
    })

    it('should return empty list when query using find All and no incidents are in database', async () => {
        const incidents = await IncidentController.getAllIncidents()

        // expect incidents to be an empty array
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(0)
    })

    it('should find all incidents when there are incidents in the database', async () => {
        // insert data into in-memory database
        await createTestIncident('test-user-findall')

        const incidents = await IncidentController.getAllIncidents()

        expect(incidents).toBeDefined()
        expect(incidents.length).toBeGreaterThan(0)
        expect(incidents[0].incidentId).toBeDefined()
    })

    it('should return incidents for a given caller', async () => {
        const caller = 'user1'
        await createTestIncident(caller)
        await createTestIncident('otherUser')

        const incidents = await IncidentController.getIncidentsByCaller(caller)
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(1)
        incidents.forEach((incident) => {
            expect(incident.caller).toBe(caller)
        })
    })

    it('should return an empty array if no incidents exist for the caller', async () => {
        const incidents =
            await IncidentController.getIncidentsByCaller('nonExistentUser')
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(0)
    })

    it('should return incident details for a given incidentId', async () => {
        const caller = 'user2'
        const incident = await createTestIncident(caller)
        const incidents = await IncidentController.getIncidentByIncidentId(
            incident.incidentId,
        )
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(1)
        expect(incidents[0].incidentId).toBe(incident.incidentId)
    })

    it('should return incident details for a given channelId', async () => {
        const caller = 'user201'
        const incident = await createTestIncidentwithGroup(caller)
        let incidents = [] as IIncident[]
        if (incident.respondersGroup) {
            incidents = await IncidentController.getIncidentByChannelId(
                incident.respondersGroup.toString(),
            )
        }
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(1)
        expect(incidents[0].incidentId).toBe(incident.incidentId)
        expect(
            incidents[0].respondersGroup?.equals(incident.respondersGroup),
        ).toBe(true)
    })

    it('should update an existing incident', async () => {
        const caller = 'user3'
        const incident = await createTestIncident(caller)
        // Prepare update data for the existing incident
        const updateData = {
            incidentId: incident.incidentId,
            owner: 'UpdatedOwner',
        }

        const updatedIncident =
            await IncidentController.updateIncident(updateData)
        expect(updatedIncident).toBeDefined()
        expect(updatedIncident?.owner).toBe('UpdatedOwner')
    })

    it('should return database error if get all incidents fails', async () => {
        // Create a partial query object implementing exec()
        const fakeQuery: Partial<Query<IIncident[], IIncident>> = {
            exec: () => Promise.reject(new Error('Mocked MongoDB error')),
        }

        // Mock Incident.find to return the fake query
        jest.spyOn(Incident, 'find').mockReturnValue(
            fakeQuery as Query<IIncident[], IIncident>,
        )
        await expect(IncidentController.getAllIncidents()).rejects.toThrow(
            Error,
        )
    })

    it('should return an error on updating an incident with missing incidentId', async () => {
        const rawIncident: Partial<IIncident> = {}
        await expect(
            IncidentController.updateIncident(rawIncident),
        ).rejects.toThrow(Error)
    })

    it('should return existing incident if there is existing incident with the same incidentId', async () => {
        const incident = await createTestIncident('exist')
        const rawIncident = incident.toObject()
        const res = await IncidentController.createIncident(rawIncident)
        expect(res).toBeDefined()

        // it should have return the existing incident
        expect(res.incidentId).toBe(incident.incidentId)
    })

    it('should create new incident since there is not existing incident with this incidentId', async () => {
        const incident = await createTestIncident('does-not-exist')
        const rawIncident = incident.toObject()
        rawIncident.caller = 'new-incident'
        rawIncident.incidentId = `I${rawIncident.caller}`
        const res = await IncidentController.createIncident(rawIncident)
        expect(res).toBeDefined()

        // it should have return the existing incident
        expect(res.incidentId).toBe(rawIncident.incidentId)
    })

    it('should create new incident with default values', async () => {
        const caller = 'Test1'
        const incident = new Incident({
            caller: caller,
        })
        const newIncident = await IncidentController.createIncident(incident)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${caller}`)
        expect(newIncident.caller).toBe(caller)
        expect(newIncident.incidentState).toBe('Waiting')
        expect(newIncident.owner).toBe('System')
        expect(newIncident.commander).toBe('System')
        expect(newIncident.address).toBe('')
        expect(newIncident.type).toBe('U')
        expect(newIncident.questions).toEqual({})
        expect(newIncident.priority).toBe(IncidentPriority.Immediate)
        expect(newIncident.incidentCallGroup).toBeNull()
    })

    it('should create new incident with provided values', async () => {
        // example id
        const validGroupId = '507f1f77bcf86cd799439011'
        const role = ROLES.FIRE
        const testCommander = await UserController.register("TestCommander", "1234", role)

        const caller = 'Test2'
        const incident = new Incident({
            incidentId: `I${caller}`,
            caller: caller,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'TestOwner',
            commander: testCommander.username,
            address: '110 Test Avenue',
            type: 'U',
            questions: {},
            priority: IncidentPriority.Immediate,
            incidentCallGroup: validGroupId,
        })

        const newIncident = await IncidentController.createIncident(incident)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${caller}`)
        expect(newIncident.caller).toBe(caller)
        expect(newIncident.incidentState).toBe('Waiting')
        expect(newIncident.owner).toBe('TestOwner')
        expect(newIncident.commander).toBe(incident.commander)
        expect(newIncident.address).toBe('110 Test Avenue')
        expect(newIncident.type).toBe('U')
        expect(newIncident.questions).toEqual({})
        expect(newIncident.priority).toBe(IncidentPriority.Immediate)
        expect(newIncident.incidentCallGroup?.toString()).toBe(validGroupId)
    })

    it('should create new incident with default values for state, owner, commander, and incidentCallGroup when passed null or undefined values', async () => {
        const caller = 'Test'
        const incident = new Incident({
            caller: caller,
            incidentState: null,
            owner: undefined,
            commander: undefined,
            incidentCallGroup: undefined,
        })

        const newIncident = await IncidentController.createIncident(incident)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${caller}`)
        expect(newIncident.caller).toBe(caller)
        expect(newIncident.incidentState).toBe('Waiting')
        expect(newIncident.owner).toBe('System')
        expect(newIncident.commander).toBe('System')
        expect(newIncident.incidentCallGroup).toBeNull()
    })

    it('should create new incident with default values for owner, commander, and incidentCallGroup when passed empty values', async () => {
        const caller = 'Test3'
        const incident = new Incident({
            caller: caller,
            owner: '',
            commander: '',
            incidentCallGroup: '',
        })

        const newIncident = await IncidentController.createIncident(incident)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${caller}`)
        expect(newIncident.caller).toBe(caller)
        expect(newIncident.owner).toBe('System')
        expect(newIncident.commander).toBe('System')
        expect(newIncident.incidentCallGroup).toBeNull()
    })

    it('should create a new SAR incident with correct type and ID format', async () => {
        const username = 'test-sar-user'
        const role = ROLES.FIRE
        const testCommander = await UserController.register(username, "1234", role)


        const sarIncident = new Incident({
            incidentId: `S${username}1`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Assigned',
            owner: username,
            commander: testCommander.username,
            type: IncidentType.Sar,
        })

        const newSARIncident =
            await IncidentController.createIncident(sarIncident)

        expect(newSARIncident).toBeDefined()
        expect(newSARIncident.incidentId).toBe(`S${username}1`)
        expect(newSARIncident.caller).toBe(username)
        expect(newSARIncident.type).toBe(IncidentType.Sar)
        expect(newSARIncident.incidentState).toBe('Assigned')
        expect(newSARIncident.owner).toBe(username)
        expect(newSARIncident.commander).toBe(sarIncident.commander)
    })

    it('shoudl find an incident by its id', async () => {
        const username = 'test-user-find'
        const incident = await createTestIncident(username)

        const foundIncident = await IncidentController.findById(
            incident._id.toString(),
        )

        expect(foundIncident).toBeDefined()
        expect(foundIncident?.incidentId).toBe(incident.incidentId)
    })

    it('should return null if incident not found', async () => {
        const objectId = new Types.ObjectId('507f1f77bcf86cd799439011')
        await IncidentController.findById(objectId).catch((error) => {
            // Handle the error if needed
            // console.error('Error finding incident:', error)
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(
                `Incident with ID '${objectId}' not found`,
            )
        })
    })

    it('should update vehicle history for given incidents', async () => {
        const username = 'test-sar-user'
        const testCars = [
            {
                name: 'Police Car 1',
                usernames: ['Officer Smith'],
                assignedIncident: null,
                assignedCity: 'New York',
            },
            {
                name: 'Police Car 2',
                usernames: ['Officer Williams'],
                assignedIncident: null,
                assignedCity: 'New York',
            },
        ]
        await Car.insertMany(testCars)
        const testIncident = await Incident.create({
            incidentId: 'Ipolice1011',
            caller: username,
            incidentState: 'Assigned',
            owner: username,
            commander: username,
            address: '',
            type: 'U',
            priority: 'E',
            incidentCallGroup: null,
            assignedVehicles: [],
            assignHistory: [],
        })

        const updatedIncident = testIncident.toObject()
        updatedIncident.assignedVehicles = [
            {
                name: 'Police Car 1',
                type: 'Car',
                usernames: ['Officer Smith'],
            },
        ]

        const res =
            await IncidentController.updateVehicleHistory(updatedIncident)

        expect(res?.assignHistory?.length).toBeGreaterThan(0)

        const lastHistory = res!.assignHistory!.at(-1)
        expect(lastHistory).toMatchObject({
            name: 'Police Car 1',
            type: 'Car',
            isAssign: true,
            usernames: ['Officer Smith'],
        })
    })

    it('Update incident should return an error if incident ID not found', async () => {
        const incidentId = 'non-existent-id'
        const updateData = {
            incidentId: incidentId,
            owner: 'UpdatedOwner',
        }
        await expect(
            IncidentController.updateIncident(updateData),
        ).rejects.toThrow(/not found/)
    })

    it('Can update incident owner and commander', async () => {
        const username = 'test-user-update'
        const incident = await createTestIncident(username)
        const updateData = {
            incidentId: incident.incidentId,
            owner: 'UpdatedOwner',
            commander: 'UpdatedCommander',
        }

        const updatedIncident =
            await IncidentController.updateIncident(updateData)

        expect(updatedIncident).toBeDefined()
        expect(updatedIncident?.owner).toBe('UpdatedOwner')
        expect(updatedIncident?.commander).toBe('UpdatedCommander')
    })

    it('Can update incdident status', async () => {
        const username = 'test-user-update-status'
        const incident = await createTestIncident(username)
        const updateData = {
            incidentId: incident.incidentId,
            incidentState: 'Closed' as IncidentState,
        }

        const updatedIncident =
            await IncidentController.updateIncident(updateData)

        expect(updatedIncident).toBeDefined()
        expect(updatedIncident?.incidentState).toBe('Closed')
    })

    it('should return incidents with matching state', async () => {
        // Create test incidents with different states
        const waitingIncident = await createTestIncident('user-waiting')
        await Incident.create({
            incidentId: 'Iassigned',
            caller: 'user-assigned',
            openingDate: new Date(),
            incidentState: 'Assigned',
            owner: 'System',
            commander: 'System',
        })

        // Test for Waiting state
        const waitingResults =
            await IncidentController.getIncidentByIncidentState('Waiting')
        expect(waitingResults).toBeDefined()
        expect(waitingResults.length).toBe(1)
        expect(waitingResults[0].incidentId).toBe(waitingIncident.incidentId)
    })

    // it('should remove assigned incident from deallocated vehicles', async () => {
    //     const testCars = [
    //         {
    //             name: 'Police Car 1',
    //             usernames: ['Officer Smith'],
    //             assignedIncident: null,
    //             assignedCity: 'New York',
    //         },
    //         {
    //             name: 'Police Car 2',
    //             usernames: ['Officer Williams'],
    //             assignedIncident: null,
    //             assignedCity: 'New York',
    //         },
    //     ]
    //     await Car.insertMany(testCars)

    //     const testIncident = await Incident.create({
    //         incidentId: 'Ipolice1011',
    //         caller: username,
    //         incidentState: 'Assigned',
    //         owner: username,
    //         commander: username,
    //         address: '',
    //         type: 'U',
    //         priority: 'E',
    //         incidentCallGroup: null,
    //         assignedVehicles: [],
    //         assignHistory: [],
    //     })

    //     const updatedIncident = {
    //         ...testIncident.toObject(),
    //         assignedVehicles: [
    //             {
    //                 name: 'Police Car 1',
    //                 type: 'Car',
    //                 usernames: ['Officer Smith'],
    //             },
    //         ],
    //     }

    //     const res = await request(app)
    //         .put('/api/incidents/updatedVehicles')
    //         .send({ incidents: [[updatedIncident]] })
    //         .expect(200)

    //     expect(res.body).toMatchObject({ message: 'success' })

    //     const car2 = await Car.findOne({
    //         name: 'Police Car 2',
    //     }).lean()
    //     expect(car2?.assignedIncident).toBe(null)
    // })

    describe('Incident Responders Group functionality', () => {
        it('should de-allocate vehicle from incident', async () => {
            const username = 'test-deallocate-user-1'
            const carName = 'test-deallocate-car-1'

            const car = await createTestCar(carName, [username])
            const incident = await createTestIncident(username)

            incident.assignedVehicles.push({
                name: carName,
                type: 'Car',
                usernames: [username],
            })
            await incident.save()

            car.assignedIncident = incident.incidentId
            await car.save()

            incident.assignedVehicles = []

            const updatedIncident =
                await IncidentController.updateVehicleHistory(incident)

            const updatedCar = await Car.findOne({ name: carName })

            expect(updatedIncident).toBeDefined()
            expect(
                updatedIncident?.assignedVehicles.find(
                    (v) => v.name === carName,
                ),
            ).toBeUndefined()
            expect(updatedCar).toBeDefined()
            expect(updatedCar!.assignedIncident).toBe(null)
        })

        it("should prevet deallocating commander's vehicle", async () => {
            const username = 'test-deallocate-user'
            const carName = 'test-deallocate-car'

            const car = await createTestCar(carName, [username])
            const incident = await createTestIncident(username)

            incident.assignedVehicles.push({
                name: carName,
                type: 'Car',
                usernames: [username, 'System'],
            })
            await incident.save()

            car.assignedIncident = incident.incidentId
            await car.save()

            incident.assignedVehicles = []

            await expect(
                IncidentController.updateVehicleHistory(incident),
            ).rejects.toThrow("Cannot deallocate commander's vehicle")
        })

        it('should update a specific SAR task by index', async () => {
            const username = 'test-sar-specific-task'
            const incident = await createTestIncident(username)

            incident.type = IncidentType.Sar
            incident.sarTasks = [
                {
                    state: 'Todo',
                    location: 'Task 0 Location',
                    startDate: new Date(),
                    hazards: [],
                    victims: [0, 0, 0, 0, 0],
                },
                {
                    state: 'InProgress',
                    location: 'Task 1 Location',
                    startDate: new Date(),
                    hazards: [],
                    victims: [0, 0, 0, 0, 0],
                },
                {
                    state: 'Todo',
                    location: 'Task 2 Location',
                    startDate: new Date(),
                    hazards: [],
                    victims: [0, 0, 0, 0, 0],
                },
            ]
            await incident.save()

            const taskId = 1
            const endDate = new Date()

            let updatedSarTasks = incident.sarTasks
            updatedSarTasks[taskId].state = 'Done'
            updatedSarTasks[taskId].endDate = endDate

            const updatedIncident = await IncidentController.updateIncident({
                incidentId: incident.incidentId,
                sarTasks: updatedSarTasks,
            })

            expect(updatedIncident?.sarTasks?.length).toBe(3)

            expect(updatedIncident?.sarTasks?.[1].state).toBe('Done')
            expect(updatedIncident?.sarTasks?.[1].endDate).toEqual(endDate)

            expect(updatedIncident?.sarTasks?.[0].state).toBe('Todo')

            expect(updatedIncident?.sarTasks?.[2].state).toBe('Todo')
        })

        it('should update SAR task from InProgress to Done with end date', async () => {
            const username = 'test-sar-update-done'
            const incident = await createTestIncident(username)

            // Add a SAR task to the incident
            incident.type = IncidentType.Sar
            incident.sarTasks = [
                {
                    state: 'InProgress',
                    location: 'Task 1 Location',
                    startDate: new Date(),
                    hazards: [],
                    victims: [0, 0, 0, 0, 0],
                },
            ]

            await incident.save()

            const taskId = 0
            const now = new Date()

            let updatedSarTasks = incident.sarTasks
            updatedSarTasks[taskId].state = 'Done'
            updatedSarTasks[taskId].endDate = now

            const updatedIncident = await IncidentController.updateIncident({
                incidentId: incident.incidentId,
                sarTasks: updatedSarTasks,
            })

            expect(updatedIncident).toBeDefined()
            expect(updatedIncident?.sarTasks?.[0].state).toBe('Done')
            expect(updatedIncident?.sarTasks?.[0].endDate).toEqual(now)
        })
    })

    describe('Assigning and releasing vehicles from incidents', () => {
        it('should add a vehicle to an incident when vehicle is not assigned', async () => {
            // Create a test incident
            const incident = await createTestIncident('test-incident-1')

            // Mock personnel and vehicle data
            const personnel = {
                _id: new Types.ObjectId().toString(),
                name: 'Test Officer',
                assignedCity: 'Test City',
                role: 'Police' as const,
                assignedVehicleTimestamp: null,
            }

            const vehicle: ICar = await createTestCar('Test Car')

            // Call the controller method
            await IncidentController.addVehicleToIncident(
                personnel,
                incident.toObject() as IIncident,
                vehicle,
            )

            // Get the updated incident from the database
            const updatedIncident = await Incident.findById(incident._id)

            // Assertions
            expect(updatedIncident).toBeDefined()
            expect(updatedIncident!.assignedVehicles).toHaveLength(1)
            expect(updatedIncident!.assignedVehicles[0].name).toBe('Test Car')
            expect(updatedIncident!.assignedVehicles[0].type).toBe('Car')
            expect(updatedIncident!.assignedVehicles[0].usernames).toContain(
                'Test Officer',
            )
        })
    })
    it('should update incident state and append to state history', async () => {
        const username = 'commanderUser'
        const incidentId = `I${username}`
        const newState = IncidentState.Triage
        await createTestIncident(username)

        const updatedIncident = await IncidentController.updateIncidentState(
            incidentId,
            newState,
            username,
        )

        expect(updatedIncident).toBeDefined()
        expect(updatedIncident?.incidentState).toBe(newState)
        expect(updatedIncident?.incidentStateHistory).toHaveLength(1)

        const historyEntry = updatedIncident?.incidentStateHistory?.[0]
        expect(historyEntry?.commander).toBe(username)
        expect(historyEntry?.incidentState).toBe(newState)
        expect(historyEntry?.role).toBeDefined()
        expect(historyEntry?.timestamp).toBeDefined()
    })
    it('should throw an error when updating a non-existent incident', async () => {
        const incidentId = 'nonexistentId'
        const newState = IncidentState.Closed
        const commander = 'CommanderUser'

        await expect(
            IncidentController.updateIncidentState(
                incidentId,
                newState,
                commander,
            ),
        ).rejects.toThrow(`Incident with ID '${incidentId}' not found`)
    })

    describe('SAR Incident functionality', () => {
        it('should get SAR incidents by owner', async () => {
            const username = 'test-sar-owner'

            // Create two SAR incidents with the same owner
            await Incident.create({
                incidentId: `S${username}1`,
                caller: username,
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: username,
                commander: username,
                type: IncidentType.Sar,
            })

            await Incident.create({
                incidentId: `S${username}2`,
                caller: username,
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: username,
                commander: username,
                type: IncidentType.Sar,
            })

            // Create a non-SAR incident with the same owner
            await Incident.create({
                incidentId: `I${username}`,
                caller: username,
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: username,
                commander: username,
                type: IncidentType.Unset,
            })

            // Get SAR incidents by owner
            const sarIncidents = await IncidentController.getSARIncidentsByOwner(username)

            // Verify results
            expect(sarIncidents).toBeDefined()
            expect(sarIncidents.length).toBe(2)
            sarIncidents.forEach(incident => {
                expect(incident.type).toBe(IncidentType.Sar)
                expect(incident.owner).toBe(username)
            })
        })

        it('should create a new SAR task for an incident', async () => {
            const username = 'test-sar-task-creator'
            const incident = await createTestIncident(username)
            incident.type = IncidentType.Sar
            await incident.save()

            const sarTask = {
                state: 'Todo' as const,
                location: 'Test Location',
                coordinates: { latitude: 37.7749, longitude: -122.4194 },
                name: 'Search Area 1',
                description: 'Search the north ridge',
                hazards: ['steep terrain', 'wildlife'],
                victims: [0, 0, 0, 0, 0]
            }

            const updatedIncident = await IncidentController.createOrUpdateSarTask(
                incident.incidentId,
                sarTask
            )

            expect(updatedIncident).toBeDefined()
            expect(updatedIncident?.sarTasks).toBeDefined()
            expect(updatedIncident?.sarTasks?.length).toBe(1)
        })
    })

    describe('Incident commander functionality', () => {
        it('should return incidents commanded by a specific user', async () => {
            const commander = 'test-commander-user'

            // Create incidents with the specified commander
            await Incident.create({
                incidentId: 'Icommander1',
                caller: 'user1',
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: 'System',
                commander: commander
            })

            await Incident.create({
                incidentId: 'Icommander2',
                caller: 'user2',
                openingDate: new Date(),
                incidentState: 'Triage',
                owner: 'System',
                commander: commander
            })

            // Create an incident with a different commander
            await Incident.create({
                incidentId: 'Iother',
                caller: 'user3',
                openingDate: new Date(),
                incidentState: 'Waiting',
                owner: 'System',
                commander: 'other-commander'
            })

            // Get incidents by commander
            const incidents = await IncidentController.getIncidentByCommander(commander)

            // Verify results
            expect(incidents).toBeDefined()
            expect(incidents.length).toBe(2)
            incidents.forEach(incident => {
                expect(incident.commander).toBe(commander)
            })
        })

        it('should return an empty array if no incidents exist for the commander', async () => {
            const incidents = await IncidentController.getIncidentByCommander('non-existent-commander')
            expect(incidents).toBeDefined()
            expect(incidents.length).toBe(0)
        })
    })

    describe('Incident closing functionality', () => {
        it('should close an incident and deallocate resources', async () => {
            // Create test data
            const username = 'test-close-incident'
            const carName = 'test-close-car'

            // Create a car and assign it to an incident
            const car = await createTestCar(carName, [username])
            const incident = await createTestIncident(username)

            // Add vehicle to incident
            incident.assignedVehicles.push({
                name: carName,
                type: 'Car',
                usernames: [username],
            })
            await incident.save()

            // Assign car to incident
            car.assignedIncident = incident.incidentId
            await car.save()

            // Mock the channel controller methods
            jest.spyOn(ChannelController, 'closeChannel').mockResolvedValue(undefined as any)

            // Mock the car and truck controller methods
            const carControllerSpy = jest.spyOn(require('../../src/controllers/CarController').default, 'updateIncident')
                .mockResolvedValue({})
            const truckControllerSpy = jest.spyOn(require('../../src/controllers/TruckController').default, 'updateIncident')
                .mockResolvedValue({})

            // Close the incident
            const closedIncident = await IncidentController.closeIncident(incident.incidentId)

            // Verify incident is closed
            expect(closedIncident).toBeDefined()
            expect(closedIncident?.incidentState).toBe('Closed')
            expect(closedIncident?.closingDate).toBeDefined()

            // Verify resources are deallocated
            expect(closedIncident?.assignedVehicles.length).toBe(0)
            expect(carControllerSpy).toHaveBeenCalledWith(carName, null)

            // Restore mocks
            carControllerSpy.mockRestore()
            truckControllerSpy.mockRestore()
        })

        it('should throw an error when closing a non-existent incident', async () => {
            const nonExistentIncidentId = 'non-existent-id'

            await expect(
                IncidentController.closeIncident(nonExistentIncidentId)
            ).rejects.toThrow(/not found/)
        })
    })

    describe('Get incidents by commander', () => {
        it('should return incidents commanded by a specific user', async () => {
            const commander = 'test-commander-user'

            // Create incidents with the specified commander
            await Incident.create({
                incidentId: 'Icommander1',
                caller: 'user1',
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: 'System',
                commander: commander
            })

            await Incident.create({
                incidentId: 'Icommander2',
                caller: 'user2',
                openingDate: new Date(),
                incidentState: 'Triage',
                owner: 'System',
                commander: commander
            })

            // Create an incident with a different commander
            await Incident.create({
                incidentId: 'Iother',
                caller: 'user3',
                openingDate: new Date(),
                incidentState: 'Waiting',
                owner: 'System',
                commander: 'other-commander'
            })

            // Get incidents by commander
            const incidents = await IncidentController.getIncidentByCommander(commander)

            // Verify results
            expect(incidents).toBeDefined()
            expect(incidents.length).toBe(2)
            incidents.forEach(incident => {
                expect(incident.commander).toBe(commander)
            })

            // Verify incident IDs
            const incidentIds = incidents.map(incident => incident.incidentId).sort((a, b) => a.localeCompare(b))
            expect(incidentIds).toEqual(['Icommander1', 'Icommander2'].sort((a, b) => a.localeCompare(b)))
        })

        it('should return an empty array if no incidents exist for the commander', async () => {
            const incidents = await IncidentController.getIncidentByCommander('non-existent-commander')
            expect(incidents).toBeDefined()
            expect(incidents.length).toBe(0)
        })
    })

    describe('Additional controller methods', () => {
        it('should get SAR incidents by owner', async () => {
            const username = 'test-sar-owner-new'

            // Create a SAR incident with the specified owner
            await Incident.create({
                incidentId: `S${username}1`,
                caller: username,
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: username,
                commander: username,
                type: IncidentType.Sar,
            })

            // Get SAR incidents by owner
            const sarIncidents = await IncidentController.getSARIncidentsByOwner(username)

            // Verify results
            expect(sarIncidents).toBeDefined()
            expect(sarIncidents.length).toBe(1)
            expect(sarIncidents[0].type).toBe(IncidentType.Sar)
            expect(sarIncidents[0].owner).toBe(username)
        })

        it('should return incidents commanded by a specific user', async () => {
            const commander = 'test-commander-user-new'

            // Create an incident with the specified commander
            await Incident.create({
                incidentId: `I${commander}`,
                caller: 'user1',
                openingDate: new Date(),
                incidentState: 'Assigned',
                owner: 'System',
                commander: commander
            })

            // Get incidents by commander
            const incidents = await IncidentController.getIncidentByCommander(commander)

            // Verify results
            expect(incidents).toBeDefined()
            expect(incidents.length).toBe(1)
            expect(incidents[0].commander).toBe(commander)
        })
    })
})
