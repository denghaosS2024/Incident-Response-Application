import mongoose, { Document, Schema } from 'mongoose'

export interface IVisitLog {
    dateTime: Date
    incidentId: string
    priority: 'E' | '1' | '2' | '3' | '4'
    location: 'Road' | 'ER'
    age?: number | null
    conscious?: 'Yes' | 'No' | null
    breathing?: 'Yes' | 'No' | null
    chiefComplaint?: string | null
    condition?:
        | 'Allergy'
        | 'Asthma'
        | 'Bleeding'
        | 'Broken bone'
        | 'Burn'
        | 'Choking'
        | 'Concussion'
        | 'Covid-19'
        | 'Heart Attack'
        | 'Heat Stroke'
        | 'Hypothermia'
        | 'Poisoning'
        | 'Seizure'
        | 'Shock'
        | 'Strain'
        | 'Sprain'
        | 'Stroke'
        | 'Others'
        | ''
        | null
    drugs?: string[] | null
    allergies?: string[] | null
    active: boolean
}

// Base interface without Document extension
export interface IPatientBase {
    patientId: string
    username: string
    name?: string
    nameLower?: string
    sex?: string
    dob?: string
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
    visitLog?: IVisitLog[]
    master?: Schema.Types.ObjectId // The first responder of this patient
}

// Document interface for Mongoose
export interface IPatient extends IPatientBase, Document {}

const VisitLogSchema = new Schema(
    {
        dateTime: {
            type: Date,
            required: true,
        },
        incidentId: {
            type: String,
        },
        priority: {
            type: String,
            enum: ['E', '1', '2', '3', '4'],
            default: 'E',
            required: true,
        },
        location: {
            type: String,
            enum: ['Road', 'ER'],
            required: true,
        },
        age: {
            type: Number,
            required: false,
        },
        conscious: {
            type: String,
            required: false,
        },
        breathing: {
            type: String,
            required: false,
        },
        chiefComplaint: {
            type: String,
            required: false,
        },
        condition: {
            type: String,
            enum: [
                'Allergy',
                'Asthma',
                'Bleeding',
                'Broken bone',
                'Burn',
                'Choking',
                'Concussion',
                'Covid-19',
                'Heart Attack',
                'Heat Stroke',
                'Hypothermia',
                'Poisoning',
                'Seizure',
                'Shock',
                'Strain',
                'Sprain',
                'Stroke',
                'Others',
                ''
            ],
            required: false,
        },
        drugs: {
            type: [String],
            required: false,
            default: undefined,
        },
        allergies: {
            type: [String],
            required: false,
            default: undefined,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false },
)

export const PatientSchema = new Schema({
    patientId: {
        type: String,
        required: true,
        unique: true,
    },

    /**
     * Username of the patient
     */
    username: {
        type: String,
        required: true,
    },

    /**
     * Name of the patient
     */
    name: {
        type: String,
        required: false,
    },

    /**
     * Lowercase name of the patient. Used for searching.
     */
    nameLower: {
        type: String,
        required: false,
    },

    /**
     * Sex of the patient
     */
    sex: {
        type: String,
        required: false,
    },

    /**
     * DoB of the patient
     */
    dob: {
        type: String,
        required: false,
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
        enum: ['ER', 'Road'],
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

    /**
     * Patient visit log array
     */
    visitLog: {
        type: [VisitLogSchema],
        default: [],
        required: true,
    },

    /**
     * Master (first responder) of the patient
     */
    master: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
})

export default mongoose.model<IPatient>('Patient', PatientSchema)
