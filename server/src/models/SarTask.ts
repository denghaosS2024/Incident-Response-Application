import { Document, Schema, model } from 'mongoose'
// import { IIncident } from './Incident'

export interface ITask extends Document {
  address: string
  hazards?: string[] | []
  status: string
}

const CarSchema = new Schema<ITask>({
  address: { type: String, required: true },
  hazards: { type: [String], default: [] },
  status: { type: String, required: true }
})

export default model<ITask>('Task', CarSchema)
