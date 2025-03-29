import request from 'supertest'
import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'
import UserController from '../../src/controllers/UserController'
import IncidentController from '../../src/controllers/IncidentController'
import ROLES from '../../src/utils/Roles'
import { IUser } from '../../src/models/User'
import Incident, { IIncident, IncidentType, IncidentPriority } from '../../src/models/Incident'
// import { Schema, Types } from 'mongoose'
// import incident from '../../src/routers/incident'
// import * as Token from '../../src/utils/Token'

describe('Dispatcher - Logout', () => {
  // Test users
  let dispatcher1: IUser
  let dispatcher2: IUser
  let dispatcher3: IUser
  let token1: string
  let token2: string
  let token3: string
  
  // Test incidents
  let triageIncident1: IIncident
  let triageIncident2: IIncident
  let waitingIncident: IIncident

  beforeAll(async () => {
    await TestDatabase.connect()

    // Create test dispatchers
    dispatcher1 = await UserController.register('dispatcher1', 'password1', ROLES.DISPATCH)
    dispatcher2 = await UserController.register('dispatcher2', 'password2', ROLES.DISPATCH)
    dispatcher3 = await UserController.register('dispatcher3', 'password3', ROLES.DISPATCH)
    
    // Log in all dispatchers
    const response1 = await request(app)
      .post('/api/login')
      .send({ username: 'dispatcher1', password: 'password1' })
    token1 = response1.body.token
    
    const response2 = await request(app)
      .post('/api/login')
      .send({ username: 'dispatcher2', password: 'password2' })
    token2 = response2.body.token
    
    const response3 = await request(app)
      .post('/api/login')
      .send({ username: 'dispatcher3', password: 'password3' })
    token3 = response3.body.token

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

  afterAll(TestDatabase.close)

  describe('Logout Dispatcher', () => {
    it('transfers command of triage incidents to less busy dispatcher on logout', async () => {
        // Initial state verification
        const initialIncident1 = await IncidentController.findById(triageIncident1._id)
        const initialIncident2 = await IncidentController.findById(triageIncident2._id)
        const initialWaitingIncident = await IncidentController.findById(waitingIncident._id)
        
        expect(initialIncident1.commander).toBe(dispatcher1.username)
        expect(initialIncident2.commander).toBe(dispatcher1.username)
        expect(initialWaitingIncident.commander).toBe(dispatcher1.username)
        
        // Dispatcher1 logs out
        await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200)
        
        // Verify triage incidents were transferred to dispatcher3 (less busy)
        const updatedIncident1 = await IncidentController.findById(triageIncident1._id)
        const updatedIncident2 = await IncidentController.findById(triageIncident2._id)
        
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
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)
        
        await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${token3}`)
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
        
        // Login dispatcher1 again
        const loginResponse = await request(app)
        .post('/api/login')
        .send({ username: 'dispatcher1', password: 'password1' })
        const newToken = loginResponse.body.token
        
        // Dispatcher1 logs out when they're the only one online
        await request(app)
        .post('/api/logout')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200)
        
        // Verify incident still belongs to dispatcher1
        const updatedIncident = await IncidentController.findById(newTriageIncident._id)
        expect(updatedIncident.commander).toBe(dispatcher1.username)
    })
    });
})