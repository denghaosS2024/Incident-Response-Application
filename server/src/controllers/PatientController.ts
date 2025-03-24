import Patient from '../models/Patient'

class PatientController {
  async getAllPatients() {
    const patients = await Patient.find()
    return patients
  }

  // Get a single patient by ID
  async getPatientById(patientId: string) {
    return Patient.findOne({ patientId })
  }

  // Create a new patient
  async createPatient(patientData) {
    const newPatient = new Patient(patientData)
    return newPatient.save()
  }

  // Update an existing patient
  async updatePatient(patientId, updateData) {
    const patient = await Patient.findOneAndUpdate({ patientId }, updateData, {
      new: true,
      runValidators: true,
    })
    if (!patient) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }
    return patient
  }

  // Delete a patient
  async deletePatient(patientId: string) {
    return Patient.findOneAndDelete({ patientId })
  }
}

export default new PatientController()
