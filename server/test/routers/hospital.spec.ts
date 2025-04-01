import mongoose from 'mongoose'
import request from 'supertest'

import app from '../../src/app'
import Patient from '../../src/models/Patient'
import * as TestDatabase from '../utils/TestDatabase'

jest.mock('../../src/utils/UserConnections', () => ({
  broadcastToHospitalRoom: jest.fn(),
  broadcast: jest.fn(),
}))

describe('Router - Hospital', () => {
  beforeAll(TestDatabase.connect)

  const createHospital = async (hospitalName: string) => {
    const response = await request(app)
      .post('/api/hospital/register')
      .send({
        hospitalName: hospitalName || 'Test Hospital',
        hospitalAddress: '123 Main St',
        totalNumberERBeds: 100,
      })
    return response.body.hospitalId // Return the generated hospitalId
  }

  const createPatient = async (patientId: string) => {
    const name = `Patient ${patientId}`
    await Patient.create({
      patientId,
      name,
      nameLower: name.toLowerCase(),
      hospitalId: null,
    })
  }

  /* -------------------------------- PUT: /api/hospital ------------------------------------ */

  it('should update the hospital', async () => {
    const hospitalId = await createHospital('123')

    const updatedData = {
      hospitalId: hospitalId,
      hospitalName: 'New Name',
    }

    const { body: updatedHospital } = await request(app)
      .put('/api/hospital')
      .send(updatedData)
      .expect(200)

    expect(updatedHospital.hospitalName).toBe(updatedData.hospitalName)
  })

  /* -------------------------------- PATCH: /api/hospital/patients/batch ------------------------------------ */

  it('should update multiple hospitals successfully', async () => {
    // Arrange
    const hospitalName1 = 'hospital_for_batch_update1'
    const hospitalName2 = 'hospital_for_batch_update2'

    const patient1 = new mongoose.Types.ObjectId().toString()
    const patient2 = new mongoose.Types.ObjectId().toString()
    const patient3 = new mongoose.Types.ObjectId().toString()

    await createPatient(patient1)
    await createPatient(patient2)
    await createPatient(patient3)

    const hospitalId1 = await createHospital(hospitalName1)
    const hospitalId2 = await createHospital(hospitalName2)

    const updates = [
      { hospitalId: hospitalId1, patients: [patient1, patient2] },
      { hospitalId: hospitalId2, patients: [patient3] },
    ]

    // Act
    const response = await request(app)
      .patch('/api/hospital/patients/batch')
      .send(updates)
      .expect(200)

    // Assert
    const updatedHospitals = response.body
    expect(updatedHospitals).toHaveLength(2)

    expect(updatedHospitals[0].hospitalId).toBe(hospitalId1)
    expect(updatedHospitals[0].patients).toEqual([patient1, patient2])

    expect(updatedHospitals[1].hospitalId).toBe(hospitalId2)
    expect(updatedHospitals[1].patients).toEqual([patient3])
  })

  it('should throw an error if one or more hospitals do not exist', async () => {
    // Arrange
    const hospitalName1 = 'existing_hospital'
    const nonExistentHospitalId = 'non_existent_hospital_id'

    const patient1 = new mongoose.Types.ObjectId().toString()
    const patient2 = new mongoose.Types.ObjectId().toString()
    const patient3 = new mongoose.Types.ObjectId().toString()

    await createPatient(patient1)
    await createPatient(patient2)
    await createPatient(patient3)

    const hospitalId1 = await createHospital(hospitalName1)

    const updates = [
      { hospitalId: hospitalId1, patients: [patient1, patient2] },
      { hospitalId: nonExistentHospitalId, patients: [patient3] }, // Non-existent hospital
    ]

    // Act & Assert
    const response = await request(app)
      .patch('/api/hospital/patients/batch')
      .send(updates)
      .expect(404)

    // Debugging logs
    console.log('Response status:', response.status)
    console.log('Response body:', response.body)

    // expect(response.body.message).toBe('One or more hospitals do not exist')
  })

  it('should return an empty array if no updates are provided', async () => {
    // Arrange
    const updates = []

    // Act
    const response = await request(app)
      .patch('/api/hospital/patients/batch')
      .send(updates)
      .expect(200)

    // Assert
    expect(response.body).toEqual([])
  })

  it('should throw an error if hospitalId is missing in one of the updates', async () => {
    // Arrange
    const hospitalName1 = 'hospital1'
    const patient1 = new mongoose.Types.ObjectId().toString()
    await createPatient(patient1)

    const hospitalId1 = await createHospital(hospitalName1)

    const updates = [
      { hospitalId: hospitalId1, patients: [patient1] },
      { patients: [patient1] }, // Missing hospitalId
    ]

    // Act & Assert
    await request(app)
      .patch('/api/hospital/patients/batch')
      .send(updates)
      .expect(400) // should change later

    // expect(response.body.message).toBe('Invalid hospitalId in update data')
  })

  /* -------------------------------- POST: /api/hospital/register ------------------------------------ */

  it('Register a new hospital', async () => {
    const hospitalData = {
      hospitalName: 'Hospital A',
      hospitalAddress: 'Mountain View',
    }

    const { body: newlyRegisteredHospital } = await request(app)
      .post('/api/hospital/register')
      .send(hospitalData)
      .expect(201)

    expect(newlyRegisteredHospital.hospitalName).toBe(hospitalData.hospitalName)
  })

  it('Verify mandatory fields while registering a hospital', async () => {
    const hospitalData = {
      hospitalName: 'Hospital A',
    }

    await request(app)
      .post('/api/hospital/register')
      .send(hospitalData)
      .expect(400)
  })

  /* -------------------------------- DELETE: /api/hospital/ ------------------------------------ */

  it('Verify an existing hospital gets deleted successfully', async () => {
    const hospitalId = await createHospital('Hospital A')
    const { body: response } = await request(app)
      .delete('/api/hospital')
      .query({ hospitalId: hospitalId })
      .send()
      .expect(200)

    expect(response.message).toBe('Hospital deleted successfully')
  })

  it('Query Param missing Error', async () => {
    const { body: response } = await request(app)
      .delete('/api/hospital')
      .query({})
      .send()
      .expect(400)

    expect(response.message).toBe('hospitalId query parameter is required.')
  })

  it('verifies right error is thrown when a hospital is not found', async () => {
    const { body: response } = await request(app)
      .delete('/api/hospital')
      .query({ hospitalId: '123' })
      .send()
      .expect(404)

    expect(response.message).toBe('No Hospital found.')
  })

  /* -------------------------------- GET: /api/hospital/ ------------------------------------ */

  it('Fetch a hospital based on hospitalId', async () => {
    const hospitalId = await createHospital('Hospital A')
    const { body: response } = await request(app)
      .get('/api/hospital')
      .query({ hospitalId: hospitalId })
      .send()
      .expect(200)

    expect(response.hospitalName).toBe('Hospital A')
  })

  it('Fetch all hospital if query param is not present', async (): Promise<void> => {
    await createHospital('Hospital A')
    await createHospital('Hospital B')

    const { body: response } = await request(app)
      .get('/api/hospital')
      .send()
      .expect(200)

    expect(Array.isArray(response)).toBe(true)
    expect(response.length).toBeGreaterThan(0)
  })

  it('Displays the right error if no hospital is found', async () => {
    const { body: response } = await request(app)
      .get('/api/hospital')
      .query({ hospitalId: 'Hospital A' })
      .send()
      .expect(404)

    expect(response.message).toBe('No Hospital found.')
  })

  /* -------------------------------- close the test database ------------------------------------ */

  afterAll(TestDatabase.close)
})
