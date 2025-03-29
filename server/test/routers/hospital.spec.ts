import request from 'supertest';

import app from '../../src/app';
import * as TestDatabase from '../utils/TestDatabase';

describe('Router - Hospital', () => {
    beforeAll(TestDatabase.connect)

    const createHospital = () => {
        return request(app)
            .post('/api/hospital/register')
            .send({
                hospitalId: "123",
                hospitalName: "Test Hospital",
                hospitalAddress: "123 Main St"
            })
    }

    it('should update the hospital', async () => {
        const hospital = await createHospital().expect(201);

        const updatedData = {
            hospitalId: hospital.body.hospitalId,
            hospitalName: 'New Name',
          };
          
          const { body: updatedHospital } = await request(app)
            .put('/api/hospital')
            .send(updatedData)
            .expect(200);
          
          expect(updatedHospital.hospitalName).toBe(updatedData.hospitalName);
    });
    
    afterAll(TestDatabase.close)
})
