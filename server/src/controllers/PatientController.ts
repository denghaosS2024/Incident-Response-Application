import { uuidv4 } from 'mongodb-memory-server-core/lib/util/utils'
import { IHospital } from '../models/Hospital'
import Patient, {
    IPatientBase,
    IVisitLog,
    PatientSchema,
} from '../models/Patient'
import { IUser } from '../models/User'
import ROLES from '../utils/Roles'
import HospitalController from './HospitalController'
import UserController from './UserController'

import HttpError from '../utils/HttpError'

export interface IExpandedPatientInfo extends IPatientBase {
    nurse?: IUser
    hospital?: IHospital
}

class PatientController {
    async getAllPatients() {
        const patients = await Patient.find()
        return patients
    }

    /**
     * Get a single patient by ID.
     *
     * @param {string} patientId - The ID of the patient to retrieve.
     * @returns patient document if found, otherwise null.
     */
    async findById(patientId: string) {
        return await Patient.findOne({ patientId }).lean()
    }

    /**
     * Get patients by hospital ID.
     *
     * @param {string} hospitalId - The ID of the hospital to filter patients by.
     * @returns an array of patient documents associated with the given hospital.
     */
    async findByHospitalId(hospitalId: string) {
        return await Patient.find({
            hospitalId: hospitalId,
        })
    }

    /**
     * Get all patients that are not assigned to any hospital.
     *
     * @returns an array of patient documents with no assigned hospital.
     */
    async getUnassignedPatients() {
        try {
            const priorityOrder = { E: 0, '1': 1, '2': 2, '3': 3, '4': 4 } // Custom priority order

            const unassignedPatients = await Patient.find({
                // hospitalId: { $in: [null, ''] }, // Patients with no assigned hospital
                location: 'Road', // Only fetch patients where location is "Road"
                priority: { $in: ['E', '1'] },
            })
                .sort({
                    priority: 1, // Sort by priority first
                    name: 1, // Sort alphabetically within the same priority
                })
                .lean()

            // Ensure sorting follows the custom priority order
            return unassignedPatients.sort(
                (a, b) =>
                    priorityOrder[a.priority ?? Number.MAX_SAFE_INTEGER] -
                        priorityOrder[b.priority ?? Number.MAX_SAFE_INTEGER] ||
                    (a.name ?? '').localeCompare(b.name ?? ''),
            )
        } catch (error) {
            console.error('Error fetching unassigned patients:', error)
            throw new Error(
                'An error occurred while retrieving unassigned patients.',
            )
        }
    }

    /**
     * Get the expanded patient info by patientId, no more joining in the frontend
     * @param patientId - The ID of the patient
     * @returns The expanded patient info
     */
    async getExpandedPatientInfo(patientId: string) {
        const patient = await this.findById(patientId)
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }

        //Turn patient into IExpandedPatientInfo
        const expandedPatientInfo: IExpandedPatientInfo = {
            ...patient,
        }

        if (Object.keys(expandedPatientInfo).includes('hospitalId')) {
            const hospital = await HospitalController.getHospitalById(
                expandedPatientInfo.hospitalId ?? '',
            )
            if (!hospital) {
                throw new Error(
                    `Hospital with ID ${patient.hospitalId} does not exist`,
                )
            }
            expandedPatientInfo.hospital = hospital
        }

        if (Object.keys(expandedPatientInfo).includes('nurseId')) {
            const nurse = await UserController.getUserById(
                expandedPatientInfo.nurseId ?? '',
            )
            if (!nurse) {
                throw new Error(
                    `User with ID ${patient.nurseId} does not exist`,
                )
            } else if (
                (await UserController.getUserRole(nurse.id)) !== ROLES.NURSE
            ) {
                throw new Error(
                    `User with ID ${patient.nurseId} is not a nurse`,
                )
            }

            expandedPatientInfo.nurse = nurse
        }

        return expandedPatientInfo
    }

    /**
     * Create a new patient
     * @param patientData - The data of the patient
     * @param callerUid - The UID of the caller (first responder)
     * @returns The created patient
     */
    async create(patientData, callerId?: string) {
        try {
            if (!callerId) {
                throw new HttpError('Caller UID is required', 400)
            }

            const payload = {
                // Generate a new patientId if not provided
                patientId: patientData.patientId || uuidv4(),
                ...patientData,
                master: callerId, // Set the master field to the caller's UID
            }

            // Ensure the nameLower field is set for searching
            if (payload.name) {
                payload.nameLower = payload.name.trim().toLowerCase()
            }

            const newPatient = await new Patient(payload).save()
            return newPatient
        } catch (error) {
            console.error('Error creating patient:', error)
            if (error instanceof HttpError) {
                throw error
            }
            throw new HttpError('Failed to create patient', 500)
        }
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
        const patient = await Patient.findOneAndUpdate(
            { patientId },
            updateData,
            {
                new: true,
                runValidators: true,
            },
        )
        if (!patient) {
            throw new Error(`Patient "${patientId}" does not exist`)
        }
        return patient
    }

    /**
     * Set the nurse of a patient
     * @param patientId - The ID of the patient
     * @param nurseId - The ID of the nurse
     * @returns The updated patient
     *
     */
    async setNurse(patientId: string, nurseId: string) {
        // Check if the user exists and is a nurse
        if ((await UserController.getUserRole(nurseId)) !== ROLES.NURSE) {
            throw new Error(`User with ID ${nurseId} is not a nurse`)
        }

        // Check if the patient exists
        const patient = await this.findById(patientId)
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }

        const res = await Patient.findOneAndUpdate(
            { patientId },
            { nurseId },
            { new: true },
        )
        if (res === null) {
            throw new Error(`Patient "${patientId}" does not exist`)
        }
        return res
    }

    /**
     * Set the hospital of a patient
     * @param patientId - The ID of the patient
     * @param hospitalId - The ID of the hospital
     * @returns The updated patient
     */
    async setHospital(patientId: string, hospitalId: string) {
        // Check if the hospital exists
        const hospital = await HospitalController.getHospitalById(hospitalId)
        if (!hospital) {
            throw new Error(`Hospital with ID ${hospitalId} does not exist`)
        }

        // Check if the patient exists
        const patient = await this.findById(patientId)
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }

        const res = await Patient.findOneAndUpdate(
            { patientId },
            { hospitalId },
            { new: true },
        )
        if (res === null) {
            throw new Error(`Patient "${patientId}" does not exist`)
        }
        return res
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

    /**
     * Creates a new visit log for a patient.
     *
     * If the patient has any active visits, they are marked as inactive.
     * The new visit is marked as active and appended to the patient's visitLog.
     *
     * @param patientId - The unique ID of the patient
     * @param patientVisitData - The visit details to log for the patient
     * @returns The updated patient document
     * @throws Error if the patient with the given ID does not exist
     */
    async createPatientVisit(patientId: string, patientVisitData: IVisitLog) {
        const patient = await Patient.findOne({ patientId })
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }

        const {
            // Required
            dateTime,
            incidentId,
            location,

            // Optional
            priority,
            age,
            conscious,
            breathing,
            chiefComplaint,
            condition,
            drugs,
            allergies,
        } = patientVisitData

        patient.visitLog?.forEach((visit) => {
            if (visit.active) {
                visit.active = false
            }
        })

        const newVisitLogEntry = {
            dateTime: dateTime ? new Date(dateTime) : new Date(),
            incidentId,
            location,
            priority: priority || 'E',
            age,
            conscious,
            breathing,
            chiefComplaint,
            condition,
            drugs,
            allergies,
            active: true,
        }

        patient.visitLog?.push(newVisitLogEntry)

        await patient.save()
        return patient
    }

    /**
     * Update the active visit log entry of a patient.
     *
     * @param patientId - ID of the patient to update
     * @param updatedVisitData - The updated visit details to log for the patient
     * @returns The updated patient document with the modified visit log
     * @throws Error if the patient with the given ID does not exist
     */
    async updatePatientVisit(patientId: string, updatedVisitData: IVisitLog) {
        const patient = await Patient.findOne({ patientId })
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }

        const activeVisit = patient.visitLog?.find((visit) => visit.active)
        if (!activeVisit) {
            throw new Error(
                `No active visit log found for patient ID ${patientId}`,
            )
        }

        // Update only the provided fields
        Object.entries(updatedVisitData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'active') {
                activeVisit[key] = value
            }
        })

        await patient.save()
        const updatedPatient = await Patient.findOne({ patientId })
        return updatedPatient
    }

    async findByLocation(location: string) {
        return await Patient.find({ location }).exec()
    }

    async updateLocation(patientId: string, location: string) {
        if (location !== 'ER' && location !== 'Road') {
            throw new Error('Invalid location')
        }
        const patient = await this.findById(patientId)
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} does not exist`)
        }
        const updatedPatient = await Patient.findOneAndUpdate(
            { patientId },
            { location },
            { new: true },
        )
        return updatedPatient
    }
}

export default new PatientController()
