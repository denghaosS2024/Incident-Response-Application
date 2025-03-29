import { mock } from 'jest-mock-extended'
import SocketIO from 'socket.io'
import request from 'supertest'
import app from '../../src/app'
import IncidentController from '../../src/controllers/IncidentController'
import UserController from '../../src/controllers/UserController'
import Incident, { IIncident, IncidentPriority, IncidentType } from '../../src/models/Incident'
import User, { IUser } from '../../src/models/User'
import ROLES from '../../src/utils/Roles'
import UserConnections from '../../src/utils/UserConnections'
import * as TestDatabase from '../utils/TestDatabase'

describe('Dispatcher - Logout', () => {
  // Test users
  let dispatcher1: IUser
  let dispatcher2: IUser
  let dispatcher3: IUser
  
  // Test incidents
  let triageIncident1: IIncident
  let triageIncident2: IIncident
  let waitingIncident: IIncident

  beforeAll( async () => {
    await TestDatabase.connect
 })
  beforeEach(async () => {
    // Create test dispatchers
    dispatcher1 = await UserController.register('dispatcher1', 'password1', ROLES.DISPATCH)
    dispatcher2 = await UserController.register('dispatcher2', 'password2', ROLES.DISPATCH)
    dispatcher3 = await UserController.register('dispatcher3', 'password3', ROLES.DISPATCH)

    // Login dispatchers
    const socket = mock<SocketIO.Socket>()
    UserConnections.addUserConnection(dispatcher1.id, socket, ROLES.DISPATCH)
    UserConnections.addUserConnection(dispatcher2.id, socket, ROLES.DISPATCH)
    UserConnections.addUserConnection(dispatcher3.id, socket, ROLES.DISPATCH)

    triageIncident1 = await new Incident({
        incidentId: 'Icitizen1',
        caller: 'citizen1',
        incidentState: 'Triage',
        owner: dispatcher1.username,
        commander: dispatcher1.username,
        address: '123 Test St',
        type: IncidentType.Medical,
        priority: IncidentPriority.Urgent
    }).save()

    triageIncident2 = await new Incident({
      incidentId: 'Icitizen2',
      caller: 'citizen2',
      incidentState: 'Triage',
      owner: dispatcher1.username,
      commander: dispatcher1.username,
      address: '456 Test Ave',
      type: IncidentType.Police,
      priority: IncidentPriority.Immediate
    }).save()
    
    waitingIncident = await new Incident({
      incidentId: 'Icitizen3',
      caller: 'citizen3',
      incidentState: 'Waiting',
      owner: dispatcher1.username,
      commander: dispatcher1.username,
      address: '789 Test Blvd',
      type: IncidentType.Fire,
      priority: IncidentPriority.CouldWait
    }).save()
    
    // Create additional triage incidents for dispatcher2 to make them "busier"
    await new Incident({
      incidentId: 'I-Test4',
      caller: 'Caller4',
      incidentState: 'Triage',
      owner: dispatcher2.username,
      commander: dispatcher2.username,
      address: '555 Busy St',
      type: IncidentType.Medical,
      priority: IncidentPriority.Urgent
    }).save()
    
    await new Incident({
      incidentId: 'I-Test5',
      caller: 'Caller5',
      incidentState: 'Triage',
      owner: dispatcher2.username,
      commander: dispatcher2.username,
      address: '666 Busy Ave',
      type: IncidentType.Police,
      priority: IncidentPriority.Immediate
    }).save()
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await Incident.deleteMany({})
    await User.deleteMany({})
    await UserConnections.removeUserConnection(dispatcher1.id)
    await UserConnections.removeUserConnection(dispatcher2.id)
    await UserConnections.removeUserConnection(dispatcher3.id)
   })

    afterAll(async () => {
      await TestDatabase.close()
    })

  describe('Logout Dispatcher', () => {
    it('transfers command of triage incidents to less busy dispatcher on logout', async () => {
        // Initial state verification
        const initialIncident1 = await IncidentController.findById(triageIncident1._id)
        const initialIncident2 = await IncidentController.findById(triageIncident2._id)
        const initialWaitingIncident = await IncidentController.findById(waitingIncident._id)
        
        // incident1 and incident2 should be assigned to dispatcher1
        expect(initialIncident1.commander).toBe(dispatcher1.username)
        expect(initialIncident2.commander).toBe(dispatcher1.username)
        expect(initialWaitingIncident.commander).toBe(dispatcher1.username)

        // Dispatcher1 logs out
        await request(app)
            .post('/api/logout')
            .send({ username: 'dispatcher1', role: ROLES.DISPATCH })
            .expect(200)
        
        // Verify triage incidents were transferred to dispatcher3 (less busy)
        const updatedIncident1 = await IncidentController.findById(triageIncident1._id)
        const updatedIncident2 = await IncidentController.findById(triageIncident2._id)
        
        // Verify that dispatcher3 is now the commander of both incidents
        expect(updatedIncident1.commander).toBe(dispatcher3.username)
        expect(updatedIncident2.commander).toBe(dispatcher3.username)
        
        // Verify waiting incident remains with dispatcher1
        const updatedWaitingIncident = await IncidentController.findById(waitingIncident._id)
        expect(updatedWaitingIncident.commander).toBe(dispatcher1.username)
    })
    
    it('does not transfer command when no other dispatchers are online', async () => {

        // Log out dispatcher2 and dispatcher3
        await request(app)
        .post('/api/logout')
        .send({ username: 'dispatcher2', role: ROLES.DISPATCH })
        .expect(200)
        
        await request(app)
        .post('/api/logout')
        .send({ username: 'dispatcher3', role: ROLES.DISPATCH })
        .expect(200)
        
        // Create a new triage incident for dispatcher1
        const newTriageIncident = await new Incident ({
            incidentId: 'I-Test6',
            caller: 'Caller6',
            incidentState: 'Triage',
            owner: dispatcher1.username,
            commander: dispatcher1.username,
            address: '999 Lone St',
            type: IncidentType.Medical,
            priority: IncidentPriority.Urgent
        }).save()
        
        // Dispatcher1 logs out when they're the only one online
        await request(app)
        .post('/api/logout')
        .send({ username: 'dispatcher1', role: ROLES.DISPATCH })
        .expect(200)
        
        // Verify incident still belongs to dispatcher1
        const updatedIncident = await IncidentController.findById(newTriageIncident._id)
        expect(updatedIncident.commander).toBe(dispatcher1.username)
    })
    });
})