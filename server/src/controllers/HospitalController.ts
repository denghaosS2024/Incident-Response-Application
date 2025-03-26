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
      const hospital = await Hospital.findOne({ hospitalId })
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
      const hospitals = await Hospital.find().sort({hospitalName: 1})
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
      if (!hospital.hospitalId) throw new Error("Invalid hospital data");

      try {
        const updatedHospital = await Hospital.findOneAndUpdate(
            { hospitalId: hospital.hospitalId},
            { $set: hospital },
            { new: true }
        ).exec();
        return updatedHospital;
    } catch (error) {
        console.error("Error updating hospital:", error);
        throw error;
    }
  }
}

export default new HospitalController()
