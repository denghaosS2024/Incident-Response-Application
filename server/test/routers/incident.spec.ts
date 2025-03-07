import request from 'supertest';
import { Types } from 'mongoose';

import app from '../../src/app';
import * as TestDatabase from '../utils/TestDatabase';

describe('Router - Incident', () => {
    beforeAll(TestDatabase.connect)

    const username: string = 'Test'

    const create = () => {
        return request(app)
            .post('/api/incidents')
            .send({
                username
            })
    }

    it('can create a new incident', async () => {
        const { body: incident } = await create().expect(201) // HTTP code for Created should be 201

        expect(incident).toMatchObject({
            incidentId: "ITest",
            caller: username,
            incidentState: "Waiting",
            owner: "System",
            commander: "System"
        })
    });

    it('will not allow to create a duplicate incident', async () => {
        await create().expect(400)
    });

    it('should get active incident for user', async () => {
        // Get active incident
        const { body: activeIncident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200);

        expect(activeIncident).toMatchObject({
            incidentId: "ITest",
            caller: username,
            incidentState: 'Waiting'
        });
    });

    it('should return 404 if no active incident found', async () => {
        await request(app)
            .get('/api/incidents/non-existent-user/active')
            .expect(404);
    });

    it('should update incident chat group', async () => {
        // First get the incident to get its _id
        const { body: incident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200);
    
        const channelId = new Types.ObjectId();
    
        const { body: updatedIncident } = await request(app)
            .put(`/api/incidents/${incident._id}/chat-group`)
            .send({ channelId: channelId.toString() })
            .expect(200);
    
        expect(updatedIncident.incidentCallGroup).toBe(channelId.toString());
    });
    
    it('should return 404 for non-existent incident', async () => {
        const nonExistentId = new Types.ObjectId();
        await request(app)
            .put(`/api/incidents/${nonExistentId}/chat-group`)
            .send({ channelId: new Types.ObjectId().toString() })
            .expect(404);
    });
    
    it('should return 400 for invalid channel ID', async () => {
        // First get the incident to get its _id
        const { body: incident } = await request(app)
            .get(`/api/incidents/${username}/active`)
            .expect(200);
        
        await request(app)
            .put(`/api/incidents/${incident._id}/chat-group`)
            .send({ channelId: 'invalid-id' })
            .expect(400);
    });

    afterAll(TestDatabase.close)
})
