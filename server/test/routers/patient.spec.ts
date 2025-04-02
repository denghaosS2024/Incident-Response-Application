import request from 'supertest'

import mongoose from 'mongoose'
import app from '../../src/app'
import Patient from '../../src/models/Patient'
import * as TestDatabase from '../utils/TestDatabase'

describe.skip('Router - Patient', () => {
  beforeAll(TestDatabase.connect)
  beforeEach(async () => {
    await Patient.deleteMany({})
  })

  const createPatient = () => {
    return request(app)
      .post('/api/patients')
      .set('x-application-uid', new mongoose.Types.ObjectId().toString())
      .send({
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
    return request(app)
      .post('/api/patients')
      .set('x-application-uid', new mongoose.Types.ObjectId().toString())
      .send({
        patientId: 'IZ6oe',
        name: 'Zoe 6E',
        nameLower: 'zoet',
        hospitalId: 'hospital1299t3',
        priority: 'could_wait',
        status: 'at_er',
        location: 'ER',
      })
  }

  const createPatient3 = () => {
    return request(app)
      .post('/api/patients')
      .set('x-application-uid', new mongoose.Types.ObjectId().toString())
      .send({
        patientId: 'IZzzz',
        name: 'Zoe zzzz',
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

  it('should be able to change the location of a patient', async () => {
    const patient = await createPatient3()
    const updatedPatient = await request(app)
      .put(`/api/patients/${patient.body.patientId}/location`)
      .send({ location: 'Road' })
      .expect(200)

    expect(updatedPatient.body.location).toBe('Road')
  })

  it('should return 400 when the location is not valid', async () => {
    const patient = await createPatient3()
    await request(app)
      .put(`/api/patients/${patient.body.patientId}/location`)
      .send({ location: 'Invalid' })
      .expect(400)
  })

  it('should return 404 when the patient is not found', async () => {
    await request(app)
      .put(`/api/patients/Invalid/location`)
      .send({ location: 'Road' })
      .expect(404)
  })

  afterAll(TestDatabase.close)
})
