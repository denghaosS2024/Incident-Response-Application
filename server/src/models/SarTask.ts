import { Document, Schema, model } from 'mongoose'
// import { IIncident } from './Incident'

export interface ITask extends Document {
  address: string
  hazards?: string[] | []
  status: string
  incidentId: string
  openingDate: Date
  closingDate?: Date
}

const SarTaskSchema = new Schema<ITask>({
  address: { type: String, required: true },
  hazards: { type: [String], default: [] },
  status: { type: String, required: true },
  incidentId: { type: String, required: true },
  openingDate: { type: Date, required: true },
  closingDate: { type: Date},

})

export default model<ITask>('Task', SarTaskSchema)
