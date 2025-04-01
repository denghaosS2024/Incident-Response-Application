import Hospital, { IHospital } from '../models/Hospital'
import HttpError from '../utils/HttpError'

class HospitalController {
  /**
   * Create a new Hospital
   * @param hospital An object of IHospital
   * @returns The new hospital object which was created
   */
  async create(hospital: IHospital) {
    try {
      const newHospital = new Hospital({
        hospitalName: hospital.hospitalName,
        hospitalAddress: hospital.hospitalAddress,
        hospitalDescription: hospital.hospitalDescription,
        totalNumberERBeds: hospital.totalNumberERBeds,
        totalNumberOfPatients: hospital.totalNumberOfPatients,
        nurses: hospital.nurses,
        hospitalGroupId: hospital.hospitalGroupId,
      })
      await newHospital.save()
      return newHospital
    } catch (error) {
      console.error('Error creating hospital:', error)
      throw new Error('Failed to create hospital')
    }
  }

  /**
   * Fetch hospital details by hospitalId
   * @param hospitalId
   * @returns The hospital object associated with the hospitalId passed
   */
  async getHospitalById(hospitalId: string) {
    try {
      const hospital = await Hospital.findOne({ hospitalId }).populate('nurses')
      if (!hospital) {
        throw new Error('Hospital not found')
      }
      return hospital
    } catch (error) {
      console.error('Error fetching hospital details:', error)
      throw new HttpError(`Hospital with ID ${hospitalId} does not exist`, 404)
    }
  }

  /**
   * Fetch all hospitals from the database
   * @returns An array of hospital objects (empty array if none found) sorted alphabetically
   */
  async getAllHospitals() {
    try {
      const hospitals = await Hospital.find().sort({ hospitalName: 1 })
      return hospitals
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      throw new Error('Failed to fetch hospitals')
    }
  }

  /**
   * Update an existing Hospital
   */
  async updateHospital(hospital: Partial<IHospital>) {
    if (!hospital.hospitalId) throw new Error('Invalid hospital data')

    try {
      const updatedHospital = await Hospital.findOneAndUpdate(
        { hospitalId: hospital.hospitalId },
        { $set: hospital },
        { new: true },
      ).exec()
      return updatedHospital
    } catch (error) {
      console.error('Error updating hospital:', error)
      throw error
    }
  }

  /**
   * Delete a hospital by hospitalId
   * @param hospitalId - The ID of the hospital to delete
   * @returns The deleted hospital object if found, otherwise null
   */
  async deleteHospital(hospitalId: string) {
    try {
      const deletedHospital = await Hospital.findOneAndDelete({
        hospitalId,
      }).exec()
      return deletedHospital
    } catch (error) {
      console.error('Error deleting hospital:', error)
      throw new Error('Failed to delete hospital')
    }
  }

  async updateMultipleHospitals(
    updates: { hospitalId: string; patients: string[] }[],
  ) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return [] // Return an empty array instead of throwing an error
    }

    for (const update of updates) {
      if (!update.hospitalId) {
        throw new HttpError('Invalid hospitalId in update data', 400)
      }
    }

    // Validate that all hospitals exist before performing updates
    const hospitalIds = updates.map((update) => update.hospitalId)
    const existingHospitals = await Hospital.find({
      hospitalId: { $in: hospitalIds },
    }).exec()

    console.log('Existing Hospitals:', existingHospitals)
    console.log('Updates:', updates)

    if (existingHospitals.length !== updates.length) {
      throw new HttpError('One or more hospitals do not exist', 404)
    }

    try {
      const updatePromises = updates.map((update) => {
        // Directly use the patients array as it is
        return Hospital.findOneAndUpdate(
          { hospitalId: update.hospitalId },
          {
            $set: {
              patients: update.patients,
              totalNumberOfPatients: update.patients.length,
            },
          }, // Overwrite patients array
          { new: true },
        ).exec()
      })

      const updatedHospitals = await Promise.all(updatePromises)
      return updatedHospitals
    } catch (error: unknown) {
      console.error('Error updating multiple hospitals:', error)
      throw new HttpError(`Failed to update multiple hospitals: ${error}`, 500)
    }
  }
}

export default new HospitalController()
