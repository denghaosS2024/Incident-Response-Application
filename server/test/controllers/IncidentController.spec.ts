import { Query, Types } from 'mongoose';
import IncidentController from '../../src/controllers/IncidentController';
import Incident, { IIncident, IncidentPriority } from '../../src/models/Incident';
import * as TestDatabase from '../utils/TestDatabase';


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

  it('should return database error if get all incidents fails', async () => {
    // Create a partial query object implementing exec()
    const fakeQuery: Partial<Query<IIncident[], IIncident>> = {
      exec: () => Promise.reject(new Error('Mocked MongoDB error')),
    };

    // Mock Incident.find to return the fake query
    jest.spyOn(Incident, 'find').mockReturnValue(
      fakeQuery as Query<IIncident[], IIncident>
    );
    await expect(IncidentController.getAllIncidents()).rejects.toThrow(Error);
  })

  it('should return an error on updating an incident with missing incidentId', async () => {
    const rawIncident: Partial<IIncident> = {};
    await expect(IncidentController.updateIncident(rawIncident)).rejects.toThrow(Error);
  })

  it('should return existing incident if there is existing incident with the same incidentId', async () => {
    const incident = await createTestIncident('exist');
    const rawIncident = incident.toObject();
    const res = await IncidentController.createIncident(rawIncident);
    expect(res).toBeDefined();
    
    // it should have return the existing incident
    expect(res.incidentId).toBe(incident.incidentId);
  })

  it('should create new incident since there is not existing incident with this incidentId', async () => {
    const incident = await createTestIncident('does-not-exist');
    let rawIncident = incident.toObject();
    rawIncident.caller = 'new-incident';
    rawIncident.incidentId = `I${rawIncident.caller}`;
    const res = await IncidentController.createIncident(rawIncident);
    expect(res).toBeDefined();
    
    // it should have return the existing incident
    expect(res.incidentId).toBe(rawIncident.incidentId);
  })

  it('should create new incident with default values', async () => {
    const caller = 'Test1';
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
    const validGroupId = '507f1f77bcf86cd799439011'; 

    const caller = 'Test2';
    const incident = new Incident({
      incidentId: `I${caller}`,
      caller: caller,
      openingDate: new Date(),
      incidentState: 'Waiting',
      owner: "TestOwner",
      commander: "TestCommander",
      address:  "110 Test Avenue" ,
      type: "U",
      questions:{},
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
    expect(newIncident.incidentCallGroup?.toString()).toBe(validGroupId);
  })

  it('should create new incident with default values for state, owner, commander, and incidentCallGroup when passed null or undefined values', async () => {
    const caller = 'Test';
    const incident = new Incident({
      caller: caller,
      incidentState: null,
      owner: undefined,
      commander: undefined,
      incidentCallGroup: undefined
    });
  
    const newIncident = await IncidentController.createIncident(incident);
  
    expect(newIncident).toBeDefined();
    expect(newIncident.incidentId).toBe(`I${caller}`);
    expect(newIncident.caller).toBe(caller);
    expect(newIncident.incidentState).toBe('Waiting'); 
    expect(newIncident.owner).toBe('System'); 
    expect(newIncident.commander).toBe('System');
    expect(newIncident.incidentCallGroup).toBeNull();
  });

  it('should create new incident with default values for owner, commander, and incidentCallGroup when passed empty values', async () => {
    const caller = 'Test3';
    const incident = new Incident({
      caller: caller,
      owner: "",
      commander: "", 
      incidentCallGroup: "",  
    });
  
    const newIncident = await IncidentController.createIncident(incident);
  
    expect(newIncident).toBeDefined();
    expect(newIncident.incidentId).toBe(`I${caller}`);
    expect(newIncident.caller).toBe(caller);
    expect(newIncident.owner).toBe("System"); 
    expect(newIncident.commander).toBe('System'); 
    expect(newIncident.incidentCallGroup).toBeNull(); 
  });
})
