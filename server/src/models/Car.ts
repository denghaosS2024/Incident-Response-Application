import { Document, Schema, model } from 'mongoose'
// import { IIncident } from './Incident'

export interface ICar extends Document {
    name: string
    assignedCity?: string | null
    usernames?: string[] | []
    assignedIncident: string | null
}

const CarSchema = new Schema<ICar>({
    name: { type: String, required: true, unique: true },
    assignedCity: { type: String, default: null },
    usernames: { type: [String], default: [] },
    assignedIncident: { type: String, default: null },
})

export default model<ICar>('Car', CarSchema)
