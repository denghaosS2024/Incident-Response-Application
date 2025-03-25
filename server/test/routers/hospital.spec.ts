import request from 'supertest';

import app from '../../src/app';
import * as TestDatabase from '../utils/TestDatabase';

describe('Router - Hospital', () => {
    beforeAll(TestDatabase.connect)

    const createHospital = () => {
        return request(app)
            .post('/api/hospital/register')
            .send({
                hospitalName: "Test Hospital",
                hospitalAddress: "123 Main St",
                hospitalDescription: "Test Hospital Description",
                totalNumberERBeds: 0,
                nurses: []
            })
    }

    it('should update the hospital', async () => {

        const { body: hospital } = await createHospital().expect(201);

        const hospitalName = "New Name";
    
        const { body: updatedHospital} = await request(app)
            .put(`/api/hospital/${hospital.id}`)
            .send({ hospitalName })
            .expect(200);
    
        expect(updatedHospital.hospitalName).toBe(hospitalName);
    });
    

    afterAll(TestDatabase.close)
})
