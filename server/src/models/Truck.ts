import { Document, Schema, model } from 'mongoose'

export interface ITruck extends Document {
  name: string
  assignedCity?: string | null
  usernames?: string[] | []
}

const TruckSchema = new Schema<ITruck>({
  name: { type: String, required: true, unique: true },
  assignedCity: { type: String, default: null },
  usernames: { type: [String], default: [] },
})

export default model<ITruck>('Truck', TruckSchema)
