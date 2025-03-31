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
    await request(app)
      .patch('/api/hospital/patients/batch')
      .send(updates)
      .expect(500)

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
      .expect(500) // should change later

    // expect(response.body.message).toBe('Invalid hospitalId in update data')
  })

  afterAll(TestDatabase.close)
})
