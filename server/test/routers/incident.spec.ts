import request from 'supertest'

import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'

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
    })

    it('will not allow to create a duplicate incident', async () => {
        await create().expect(400)
    })

    afterAll(TestDatabase.close)
})
