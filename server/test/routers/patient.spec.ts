import request from 'supertest'

import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'

describe('Router - Patient', () => {
  beforeAll(TestDatabase.connect)

  const createPatient = () => {
    return request(app).post('/api/patients').send({
      patientId: 'IZoe',
      name: 'Zoe E',
      nameLower: 'zoe',
      hospitalId: 'hospital123',
      priority: 'could_wait',
      status: 'at_er',
      location: 'ER',
    })
  }

  const createPatient2 = () => {
    return request(app).post('/api/patients').send({
      patientId: 'IZ6oe',
      name: 'Zoe 6E',
      nameLower: 'zoet',
      hospitalId: 'hospital1299t3',
      priority: 'could_wait',
      status: 'at_er',
      location: 'ER',
    })
  }

  it('should be able to search for a patient who belongs to a certain hospital', async () => {
    await createPatient().expect(201)
    await createPatient2().expect(201)
    const response = await request(app)
      .get('/api/patients?hospitalId=hospital123')
      .expect(200)

      console.log(response.body.name)
   expect(response.body[0].hospitalId).toBe('hospital123')
  })

  afterAll(TestDatabase.close)
})
