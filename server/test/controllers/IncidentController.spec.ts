import { Types } from 'mongoose'
import IncidentController from '../../src/controllers/IncidentController'
import Incident from '../../src/models/Incident'
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
    await Incident.findByIdAndUpdate(incident._id, { incidentState: 'Closed' })

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

  it('should update an existing incident', async () => {
    const caller = 'user3'
    const incident = await createTestIncident(caller)
    // Prepare update data for the existing incident
    const updateData = {
      incidentId: incident.incidentId,
      owner: 'UpdatedOwner',
    }

    const updatedIncident = await IncidentController.updateIncident(updateData)
    expect(updatedIncident).toBeDefined()
    expect(updatedIncident?.owner).toBe('UpdatedOwner')
  })

  it('should return null if the incident does not exist', async () => {
    const updateData = {
      incidentId: 'InonExistent',
      owner: 'someone',
    }

    const updatedIncident = await IncidentController.updateIncident(updateData)
    expect(updatedIncident).toBeNull()
  })
})
