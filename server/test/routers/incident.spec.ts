import { Query, Types } from 'mongoose'
import request from 'supertest'

import app from '../../src/app'
import Car from '../../src/models/Car'
import Incident, { IIncident } from '../../src/models/Incident'
import * as TestDatabase from '../utils/TestDatabase'

describe('Router - Incident', () => {
    beforeAll(TestDatabase.connect)
    const username: string = 'Test'

    const create = () => {
        return request(app).post('/api/incidents').send({
            username,
        })
    }

    it('can create a new incident', async () => {
        const { body: incident } = await create().expect(201) // HTTP code for Created should be 201

        expect(incident).toMatchObject({
            incidentId: 'ITest',
            caller: username,
            incidentState: 'Waiting',
            owner: 'System',
            commander: 'System',
        })
    })

    it('will not allow to create a duplicate incident', async () => {
        await create().expect(400)
    })

    it('should get active incident for user', async () => {
        // Get active incident
        const { body: activeIncident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200)

        expect(activeIncident).toMatchObject({
            incidentId: 'ITest',
            caller: username,
            incidentState: 'Waiting',
        })
    })

    it('should return 404 if no active incident found', async () => {
        await request(app)
            .get('/api/incidents/non-existent-user/active')
            .expect(404)
    })

    it('should update incident chat group', async () => {
        // First get the incident to get its _id
        const { body: incident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200)

        const channelId = new Types.ObjectId()

        const { body: updatedIncident } = await request(app)
            .put(`/api/incidents/${incident._id}/chat-group`)
            .send({ channelId: channelId.toString() })
            .expect(200)

        expect(updatedIncident.incidentCallGroup).toBe(channelId.toString())
    })

    it('should return 404 for non-existent incident', async () => {
        const nonExistentId = new Types.ObjectId()
        await request(app)
            .put(`/api/incidents/${nonExistentId}/chat-group`)
            .send({ channelId: new Types.ObjectId().toString() })
            .expect(404)
    })

    it('should return 400 for invalid channel ID', async () => {
        // First get the incident to get its _id
        const { body: incident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200)

        await request(app)
            .put(`/api/incidents/${incident._id}/chat-group`)
            .send({ channelId: 'invalid-id' })
            .expect(400)
    })

    it('should return 204 for get all incidents if none exist', async () => {
        // TODO: Tech Debt - Clear all incidents before running this test manually for now
        // There is some dependency between tests rn because when each test create an incident,
        // it is not being deleted after the test is done

        await Incident.deleteMany({})

        await request(app).get('/api/incidents').expect(204)
    })

    it('should return all incidents if they exist', async () => {
        // Create an incident
        await create().expect(201)

        const { body: incidents } = await request(app)
            .get('/api/incidents')
            .expect(200)

        expect(incidents.length).toBeGreaterThan(0)
    })

    it('should return 500 for error in getting all incidents', async () => {
        // Mock the find method to throw an error
        const fakeQuery: Partial<Query<IIncident[], IIncident>> = {
            exec: () => Promise.reject(new Error('Mocked MongoDB error')),
        }

        // Mock Incident.find to return the fake query
        jest.spyOn(Incident, 'find').mockReturnValue(
            fakeQuery as Query<IIncident[], IIncident>,
        )

        await request(app).get('/api/incidents').expect(500)
    })

    it('should update vehicle history for given incidents', async () => {
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

        const updatedIncident = {
            ...testIncident.toObject(),
            assignedVehicles: [
                {
                    name: 'Police Car 1',
                    type: 'Car',
                    usernames: ['Officer Smith'],
                },
            ],
        }

        const res = await request(app)
            .put('/api/incidents/updatedVehicles')
            .send({ incidents: [[updatedIncident]] })
            .expect(200)

        expect(res.body).toMatchObject({ message: 'success' })

        const after = await Incident.findOne({
            incidentId: 'Ipolice1011',
        }).lean()
        expect(after?.assignHistory?.length).toBeGreaterThan(0)

        const lastHistory = after!.assignHistory!.at(-1)
        expect(lastHistory).toMatchObject({
            name: 'Police Car 1',
            type: 'Car',
            isAssign: true,
            usernames: ['Officer Smith'],
        })
    })

    it('Update should return 404 for non-existent incident ID', async () => {
        await request(app)
            .put('/api/incidents/update')
            .send({ incidentId: new Types.ObjectId().toString() })
            .expect(404)
    })

    // it('should close an incident with vehicles and groups', async () => {
    //     const carName = 'UnitTestCar'
    //     const commander = 'TestCommander'
    //     const officer = 'OfficerCar'
    //     const caller = 'CloseFullTestUser'

    //     const officerUser = await User.create({
    //         username: officer,
    //         role: 'Police',
    //         password: 'testpass123',
    //     })

    //     const commanderUser = await User.create({
    //         username: commander,
    //         role: 'Police',
    //         password: 'testpass123',
    //     })

    //     await Car.create({
    //         name: carName,
    //         usernames: [officer],
    //         assignedIncident: null,
    //         assignedCity: 'TestCity',
    //     })

    //     const callGroup = await Channel.create({
    //         name: `CallGroup_${Date.now()}`,
    //         users: [officerUser._id],
    //         closed: false,
    //     })

    //     const responderGroup = await Channel.create({
    //         name: `ResponderGroup_${Date.now()}`,
    //         users: [officerUser._id, commanderUser._id],
    //         closed: false,
    //     })

    //     const testIncident = await Incident.create({
    //         incidentId: `I${caller}`,
    //         caller,
    //         incidentState: 'Assigned',
    //         owner: caller,
    //         commander,
    //         address: 'Test address',
    //         type: 'S',
    //         priority: 'Three',
    //         assignedVehicles: [
    //             { type: 'Car', name: carName, usernames: [officer] },
    //         ],
    //         assignHistory: [],
    //         incidentCallGroup: callGroup._id,
    //         respondersGroup: responderGroup._id,
    //     })

    //     const res = await request(app)
    //         .delete(`/api/incidents/${testIncident.incidentId}`)
    //         .expect(200)

    //     expect(res.body.incidentState).toBe('Closed')
    //     expect(res.body.closingDate).toBeTruthy()
    //     expect(res.body.assignedVehicles.length).toBe(0)
    //     expect(res.body.incidentCallGroup).toBe(null)
    //     expect(res.body.respondersGroup).toBe(null)

    //     const carAfter = await Car.findOne({ name: carName }).lean()
    //     expect(carAfter?.assignedIncident).toBe(null)

    //     const callGroupAfter = await Channel.findById(callGroup._id).lean()
    //     expect(callGroupAfter?.closed).toBe(true)

    //     const responderGroupAfter = await Channel.findById(
    //         responderGroup._id,
    //     ).lean()
    //     expect(responderGroupAfter?.closed).toBe(true)
    // })

    it('should remove assigned incident from deallocated vehicles', async () => {
        const testCars = [
            {
                name: 'Police Car 3',
                usernames: ['Officer Smith'],
                assignedIncident: null,
                assignedCity: 'New York',
            },
            {
                name: 'Police Car 4',
                usernames: ['Officer Williams'],
                assignedIncident: null,
                assignedCity: 'New York',
            },
        ]
        await Car.insertMany(testCars)

        const testIncident = await Incident.create({
            incidentId: 'Ipolice1012',
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

        const updatedIncident = {
            ...testIncident.toObject(),
            assignedVehicles: [
                {
                    name: 'Police Car 3',
                    type: 'Car',
                    usernames: ['Officer Smith'],
                },
            ],
        }

        const res = await request(app)
            .put('/api/incidents/updatedVehicles')
            .send({ incidents: [[updatedIncident]] })
            .expect(200)

        expect(res.body).toMatchObject({ message: 'success' })

        const car2 = await Car.findOne({
            name: 'Police Car 4',
        }).lean()
        expect(car2?.assignedIncident).toBe(null)
    })

    it('should return 404 when updating an incident that does not exist', async () => {
        await request(app)
            .put('/api/incidents/update')
            .send({ incidentId: new Types.ObjectId().toString() })
            .expect(404)
    })

    it('should update an incident', async () => {
        await request(app)
            .put(`/api/incidents/update`)
            .send({ incidentId: 'ITest', incidentState: 'Assigned' })
            .expect(204)
    })

    it('should return 400 when the incidentId is not provided for update', async () => {
        await request(app)
            .put(`/api/incidents/update`)
            .send({ incidentState: 'Assigned' })
            .expect(400)
    })

    it('should return 400 when the incidentId is not provided for chat group', async () => {
        await request(app)
            .put(`/api/incidents/ITest/chat-group`)
            .send({ channelId: new Types.ObjectId().toString() })
            .expect(400)
    })

    it('should return 400 when body has incomplete fields', async () => {
        await request(app)
            .post('/api/incidents/new')
            .send({ incidentId: 'ITest'})
            .expect(400)
    })
    

    afterAll(TestDatabase.close)
})
