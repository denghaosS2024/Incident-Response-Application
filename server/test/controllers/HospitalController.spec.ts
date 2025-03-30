import mongoose from 'mongoose'
import Hospital from '../../src/models/Hospital'

import HospitalController from '../../src/controllers/HospitalController'
import * as TestDatabase from '../utils/TestDatabase'

describe('Hospital Controller', () => {
  beforeAll(TestDatabase.connect)
  beforeEach(() => jest.clearAllMocks())
  afterEach(async () => {
    jest.restoreAllMocks()
    await Hospital.deleteMany({})
  })
  afterAll(TestDatabase.close)

  const createTestHospital = async (hospitalId: string) => {
    const newHospital = new Hospital({
      hospitalId: hospitalId,
      hospitalName: 'Test Hospital',
      hospitalAddress: '123 Main St',
      hospitalDescription: 'Test hospital',
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
    })
    return newHospital.save()
  }

  it('should update hospital', async () => {
    const hospital = await createTestHospital('hospital1')

    const updatedData = {
      hospitalId: hospital.hospitalId,
      hospitalName: 'El Camino Hospital',
      hospitalAddress: '123 New Street',
    }

    const result = await HospitalController.updateHospital(updatedData)

    expect(result).toBeDefined()
    expect(result?.hospitalName?.toString()).toBe(
      updatedData.hospitalName.toString(),
    )
    expect(result?.hospitalAddress?.toString()).toBe(
      updatedData.hospitalAddress.toString(),
    )
  })

  it('should update multiple hospitals successfully', async () => {
    const hospitalId1 = 'hospital_for_batch_update1'
    const hospitalId2 = 'hospital_for_batch_update2'

    // Arrange
    const patient1 = new mongoose.Types.ObjectId()
    const patient2 = new mongoose.Types.ObjectId()
    const patient3 = new mongoose.Types.ObjectId()

    await createTestHospital(hospitalId1)
    await createTestHospital(hospitalId2)

    const updates = [
      {
        hospitalId: hospitalId1,
        patients: [patient1.toString(), patient2.toString()],
      },
      { hospitalId: hospitalId2, patients: [patient3.toString()] },
    ]

    // Act
    const result = await HospitalController.updateMultipleHospitals(updates)

    // Assert
    expect(result).toHaveLength(2)
    expect(result[0]?.hospitalId).toBe(hospitalId1)
    expect(result[0]?.patients.map((p) => p.toString())).toEqual([
      patient1.toString(),
      patient2.toString(),
    ])
    expect(result[1]?.hospitalId).toBe(hospitalId2)
    expect(result[1]?.patients.map((p) => p.toString())).toEqual([
      patient3.toString(),
    ])

    // Assert database state using getHospitalById
    const updatedHospital1 =
      await HospitalController.getHospitalById(hospitalId1)
    const updatedHospital2 =
      await HospitalController.getHospitalById(hospitalId2)

    expect(updatedHospital1).toBeDefined()
    expect(updatedHospital1?.patients.map((p) => p.toString())).toEqual([
      patient1.toString(),
      patient2.toString(),
    ])

    expect(updatedHospital2).toBeDefined()
    expect(updatedHospital2?.patients.map((p) => p.toString())).toEqual([
      patient3.toString(),
    ])
  })

  it('should throw an error if one or more hospitals do not exist', async () => {
    // Arrange
    const hospitalId1 = 'existing_hospital'
    const hospitalId2 = 'non_existent_hospital'

    const patient1 = new mongoose.Types.ObjectId()
    const patient2 = new mongoose.Types.ObjectId()
    const patient3 = new mongoose.Types.ObjectId()

    await createTestHospital(hospitalId1)

    const updates = [
      {
        hospitalId: hospitalId1,
        patients: [patient1.toString(), patient2.toString()],
      },
      { hospitalId: hospitalId2, patients: [patient3.toString()] }, // Non-existent hospital
    ]

    // Act & Assert
    await expect(
      HospitalController.updateMultipleHospitals(updates),
    ).rejects.toThrow('One or more hospitals do not exist')

    // Assert database state remains unchanged
    const updatedHospital1 =
      await HospitalController.getHospitalById(hospitalId1)
    expect(updatedHospital1?.patients).toEqual([])
  })

  it('should return an empty array if no updates are provided', async () => {
    // Arrange
    const updates: any[] = []

    // Act
    const result = await HospitalController.updateMultipleHospitals(updates)

    // Assert
    expect(result).toEqual([])

    // Assert database state remains unchanged
    const hospitals = await Hospital.find().exec()
    expect(hospitals).toHaveLength(0)
  })
})
