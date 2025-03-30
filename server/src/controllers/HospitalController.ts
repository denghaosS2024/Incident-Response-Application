import Hospital, { IHospital } from '../models/Hospital'

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
      throw new Error('Failed to fetch hospital details')
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

  async updateMultipleHospitals(
    updates: { hospitalId: string; patients: string[] }[],
  ) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return [] // Return an empty array instead of throwing an error
    }

    // Validate that all hospitals exist before performing updates
    const hospitalIds = updates.map((update) => update.hospitalId)
    const existingHospitals = await Hospital.find({
      hospitalId: { $in: hospitalIds },
    }).exec()

    if (existingHospitals.length !== updates.length) {
      throw new Error('One or more hospitals do not exist')
    }

    try {
      const updatePromises = updates.map((update) => {
        if (!update.hospitalId) {
          throw new Error('Invalid hospitalId in update data')
        }

        // Directly use the patients array as it is
        return Hospital.findOneAndUpdate(
          { hospitalId: update.hospitalId },
          { $set: { patients: update.patients } }, // Overwrite patients array
          { new: true },
        ).exec()
      })

      const updatedHospitals = await Promise.all(updatePromises)
      return updatedHospitals
    } catch (error: unknown) {
      console.error('Error updating multiple hospitals:', error)
      throw new Error(`Failed to update multiple hospitals: ${error}`)
    }
  }
}

export default new HospitalController()
