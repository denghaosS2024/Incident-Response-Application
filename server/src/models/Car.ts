import { Document, Schema, model } from 'mongoose'
// import { IIncident } from './Incident'

export interface ICar extends Document {
  name: string
  assignedCity?: string | null
  usernames?: string[] | []
  assignedIncidents?: Schema.Types.ObjectId[] | []
}

const CarSchema = new Schema<ICar>({
  name: { type: String, required: true, unique: true },
  assignedCity: { type: String, default: null },
  usernames: { type: [String], default: [] },
  assignedIncidents: { type: [Schema.Types.ObjectId], default: [] },
})

export default model<ICar>('Car', CarSchema)
