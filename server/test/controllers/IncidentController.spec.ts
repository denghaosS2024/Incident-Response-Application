import { Query, Types } from 'mongoose'
import IncidentController from '../../src/controllers/IncidentController'
import Car from '../../src/models/Car'
import Incident, {
    IIncident,
    IncidentPriority,
} from '../../src/models/Incident'
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
            incidentCallGroup: new Types.ObjectId(),
        })

        return rawIncident.save()
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
    it('will prevent duplicate incidents', async () => {
        const username: string = 'test-username-2'
        await createTestIncident(username)

        await expect(IncidentController.create(username)).rejects.toThrow(
            `Incident "I${username}" already exists`,
        )
    })

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

    it('should return null if incident not found', async () => {
        const result = await IncidentController.updateChatGroup(
            new Types.ObjectId(),
            new Types.ObjectId(),
        )
        expect(result).toBeNull()
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
        const incident = await createTestIncident(caller)
        let incidents = [] as IIncident[]
        if (incident.incidentCallGroup) {
            incidents = await IncidentController.getIncidentByChannelId(
                incident.incidentCallGroup.toString(),
            )
        }
        expect(incidents).toBeDefined()
        expect(incidents.length).toBe(1)
        expect(incidents[0].incidentId).toBe(incident.incidentId)
        expect(
            incidents[0].incidentCallGroup?.equals(incident.incidentCallGroup),
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
        let rawIncident = incident.toObject()
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

        const caller = 'Test2'
        const incident = new Incident({
            incidentId: `I${caller}`,
            caller: caller,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'TestOwner',
            commander: 'TestCommander',
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
        expect(newIncident.commander).toBe('TestCommander')
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

        const sarIncident = new Incident({
            incidentId: `S${username}1`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Assigned',
            owner: username,
            commander: username,
            type: 'S',
        })

        const newSARIncident =
            await IncidentController.createIncident(sarIncident)

        expect(newSARIncident).toBeDefined()
        expect(newSARIncident.incidentId).toBe(`S${username}1`)
        expect(newSARIncident.caller).toBe(username)
        expect(newSARIncident.type).toBe('S')
        expect(newSARIncident.incidentState).toBe('Assigned')
        expect(newSARIncident.owner).toBe(username)
        expect(newSARIncident.commander).toBe(username)
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
            console.error('Error finding incident:', error)
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
          incidentState: 'Closed',
      }

      const updatedIncident =
          await IncidentController.updateIncident(updateData)

      expect(updatedIncident).toBeDefined()
      expect(updatedIncident?.incidentState).toBe('Closed')
  })

    describe('Incident Responders Group functionality', () => {
        //todo: fix me
        it.skip('should create a new responders channel when commander is on a vehicle', async () => {
            const username = 'test-responder-group'
            let incident = await createTestIncident(username)
            incident.commander = 'CommanderUser'
            incident.assignedVehicles = [
                {
                    type: 'Car',
                    name: 'CarA',
                    usernames: ['CommanderUser', 'Responder1', 'Responder2'],
                },
                { type: 'Truck', name: 'TruckA', usernames: ['Responder3'] },
                { type: 'Car', name: 'CarB', usernames: ['Responder4'] },
            ]
            await incident.save()

            const updatedIncident =
                await IncidentController.createOrUpdateRespondersGroup(incident)

            expect(updatedIncident.channel).toBeDefined()
            expect(updatedIncident.channel.name).toBe(
                `${incident.incidentId}_Resp`,
            )
            const expectedUsers = new Set([
                'CommanderUser',
                'Responder1',
                'Responder2',
                'Responder3',
                'Responder4',
            ])
            expect(new Set(updatedIncident.channel.users)).toEqual(
                expectedUsers,
            )
            expect(updatedIncident.channel.owner).toBe(incident.commander)
            expect(updatedIncident.channel.messages).toEqual([])
            expect(updatedIncident.channel.closed).toBe(false)
        })
    })
})
