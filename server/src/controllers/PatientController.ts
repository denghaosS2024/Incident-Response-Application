import { uuidv4 } from 'mongodb-memory-server-core/lib/util/utils'
import Patient, { PatientSchema } from '../models/Patient'

class PatientController {
  async getAllPatients() {
    const patients = await Patient.find()
    return patients
  }

  // Get a single patient by ID
  async findById(patientId: string) {
    return await Patient.findOne({ patientId })
  }

  /**
   * Create a new patient
   * @param patientData - The data of the patient
   * @returns The created patient
   */
  async create(patientData) {
    const payload = {
      // In case the patientId is not provided, generate a new one
      patientId: uuidv4(),
      ...patientData,
    }

    if (Object.keys(payload).includes('name')) {
      payload['nameLower'] = (payload['name'] ?? '').trim().toLowerCase()
    }

    const newPatient = await new Patient(payload).save()
    return newPatient
  }

  /**
   * Set the priority of a patient
   * @param patientId - The ID of the patient
   * @param priority - The priority to set, which should be one of the values in the enum of the priority field in the Patient model
   * @returns The updated patient
   */
  async setPriority(patientId: string, priority: string) {
    const column = PatientSchema.obj.priority ?? {}
    const candidates = new Set(column['enum'] ?? [])

    if (!candidates.has(priority)) {
      throw new Error(`Invalid Patient priority: ${priority}`)
    }

    const res = await Patient.findOneAndUpdate(
      { patientId },
      { priority },
      { new: true },
    )

    if (res === null) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }

    return res
  }

  /**
   * Set the ER status of a patient
   * @param patientId - The ID of the patient
   * @param status - The status to set, which should be one of the values in the enum of the status field in the Patient model
   * @returns The updated patient
   */
  async setERStatus(patientId: string, status: string) {
    // Fetch the enum from the schema
    const column = PatientSchema.obj.status ?? {}
    const candidates = new Set(column['enum'] ?? [])

    if (!candidates.has(status)) {
      throw new Error(`Invalid Patient status: ${status}`)
    }

    const res = await Patient.findOneAndUpdate(
      { patientId },
      { status },
      { new: true },
    )

    if (res === null) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }

    return res
  }

  /**
   * Set the name of a patient
   * @param patientId - The ID of the patient
   * @param name - The name to set
   * @returns The updated patient
   */
  async setName(patientId: string, name: string) {
    const nameLower = name.trim().toLowerCase()

    const res = await Patient.findOneAndUpdate(
      { patientId },
      { name, nameLower },
      { new: true, upsert: true },
    )

    if (res === null) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }

    return res
  }

  /**
   * Update an existing patient
   * @param patientId - The ID of the patient
   * @param updateData - The data to update
   * @returns The updated patient
   */
  async update(patientId, updateData) {
    const patient = await Patient.findOneAndUpdate({ patientId }, updateData, {
      new: true,
      runValidators: true,
    })
    if (!patient) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }
    return patient
  }

  /**
   * Delete a patient
   * @param patientId - The ID of the patient
   * @returns The deleted patient
   */
  async delete(patientId: string) {
    const res = await Patient.findOneAndDelete({ patientId })
    if (res === null) {
      throw new Error(`Patient "${patientId}" does not exist`)
    }
    return res
  }
}

export default new PatientController()
