import mongoose, { Document, Schema } from 'mongoose'

// Base interface without Document extension
export interface IPatientBase {
    patientId: string
    name: string
    nameLower: string
    visitLog?: { date: string; location: string; link: string }[]
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
}

// Document interface for Mongoose
export interface IPatient extends Document {
    patientId: string
    name: string
    nameLower: string
    visitLog?: { date: string; location: string; link: string }[]
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
}

export const PatientSchema = new Schema({
    patientId: {
        type: String,
        required: true,
        unique: true,
    },
    /**
     * Name of the patient
     */
    name: {
        type: String,
        required: true,
    },

    /**
     * Lowercase name of the patient. Used for searching.
     */
    nameLower: {
        type: String,
        required: true,
    },

    /**
     * Nurse ID, should be A user's _id that is a nurse
     */
    nurseId: {
        type: String,
    },

    /**
     * Hospital ID, should be a hospital's _id
     */
    hospitalId: {
        type: String,
    },

    /**
     * Location of the patient, e.g., 'ER', 'Hospital', etc.
     */
    location: {
        type: String,
    },

    /**
     * Priority of the patient, which is a string in enum ['e', 'could_wait', 'dismissed', 'dead']
     */
    priority: {
        type: String,
        enum: ['e', 'could_wait', 'dismissed', 'dead'],
    },

    /**
     * Status of the patient, which is a string in enum ['to_er', 'at_er', 'others']
     */
    status: {
        type: String,
        enum: ['to_er', 'at_er', 'others'],
    },
})

export default mongoose.model<IPatient>('Patient', PatientSchema)
