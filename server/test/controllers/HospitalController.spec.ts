import Hospital from '../../src/models/Hospital';

import HospitalController from '../../src/controllers/HospitalController';
import * as TestDatabase from '../utils/TestDatabase';


describe('Hospital Controller', () => {
  beforeAll(TestDatabase.connect)
  beforeEach(() => jest.clearAllMocks())
  afterEach(async () => {
    jest.restoreAllMocks()
    await Hospital.deleteMany({})
  })
  afterAll(TestDatabase.close)

  const createTestHospital = async () => {
    const newHospital = new Hospital(
        {
          hospitalName: 'Test Hospital',
          hospitalAddress: '123 Main St',
          hospitalDescription: 'Test hospital',
          totalNumberERBeds: 0,
          totalNumberOfPatients: 0
        });
    return newHospital.save()
  }

  it('should update hospital', async () => {
    const hospital = await createTestHospital()

    const updatedData = {
        hospitalName: 'El Camino Hospital',
        hospitalAddress: '123 New Street',
    };

    const result = await HospitalController.updateHospital(
      hospital._id,
      updatedData,
    )

    expect(result).toBeDefined()
    expect(result?.hospitalName?.toString()).toBe(updatedData.hospitalName.toString())
    expect(result?.hospitalAddress?.toString()).toBe(updatedData.hospitalAddress.toString())
  })

})
