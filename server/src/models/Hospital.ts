import mongoose, { Document, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IHospital extends Document {
  hospitalId: string
  hospitalName: string
  hospitalAddress: string
  hospitalDescription: string
  totalNumberERBeds: number
  totalNumberOfPatients: number
  nurses: string[]
}

const HospitalSchema = new Schema({
  hospitalId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  hospitalName: {
    type: String,
    required: true,
    unique: false,
  },
  hospitalAddress: {
    type: String,
    required: true,
    unique: true,
  },
  hospitalDescription: {
    type: String,
    required: false,
    unique: false,
  },
  totalNumberERBeds: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  totalNumberOfPatients: {
    type: Number,
    required: false,
    unique: false,
  },
  nurses: {
    type: [String],
    required: false,
    unique: false,
    default: [],
  },
})

export default mongoose.model<IHospital>('Hospital', HospitalSchema)
