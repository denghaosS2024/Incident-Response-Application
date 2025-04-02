// import { Query, Types } from 'mongoose'
import PatientController from '../../src/controllers/PatientController'
import Patient from '../../src/models/Patient'
import * as TestDatabase from '../utils/TestDatabase'

describe.skip('Patient Controller', () => {
  beforeAll(TestDatabase.connect)
  beforeEach(() => jest.clearAllMocks())
  afterEach(async () => {
    jest.restoreAllMocks()
    await Patient.deleteMany({})
  })
  afterAll(TestDatabase.close)


  const createTestPatient = async (username: string) => {
    const rawPatient = new Patient({
      patientId: `I${username}`,
      name: 'Zoe E',
      nameLower: 'zoe',
      hospitalId: 'hospital123',
      priority: 'could_wait',
      status: 'to_er',
      location: 'Road',
    })

    return rawPatient.save()
  }

  it('should be able to get all patients by hospitalID', async () => {
    await createTestPatient('Zoe')
    const patients = await PatientController.findByHospitalId('hospital123')

    // expect incidents to be an empty array
    expect(patients).toBeDefined()
    expect(patients.length).toBe(1)
    expect(patients[0].hospitalId).toBe('hospital123')
    expect(patients[0].name).toBe('Zoe E')
  })

  it('should be able to change the location of a patient', async () => {
    const patient = await createTestPatient('Zoe')
    const updatedPatient = await PatientController.updateLocation(patient.patientId, 'ER')
    expect(updatedPatient?.location).toBe('ER')
  })

  it('should throw an error if the patient does not exist', async () => {
    await expect(PatientController.updateLocation('I123', 'ER')).rejects.toThrow('Patient with ID I123 does not exist')
  })

  it('should throw error if location is not ER or Road', async () => {
    const patient = await createTestPatient('Zoe')
    await expect(PatientController.updateLocation(patient.patientId, 'Hospital')).rejects.toThrow('Invalid location')
  })

})
