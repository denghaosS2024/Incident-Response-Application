import mongoose, { Document, Schema, Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

// TODO: The totalnumberofpatients field is redundant and should be removed in the future, can just use patients.length
export interface IHospital extends Document {
  hospitalId: string
  hospitalName: string
  hospitalAddress: string
  hospitalDescription: string
  totalNumberERBeds: number
  totalNumberOfPatients: number
  nurses: Schema.Types.ObjectId[]
  patients: Schema.Types.ObjectId[]
  hospitalGroupId?: Types.ObjectId
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
    unique: false,
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
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: false,
    unique: false,
    default: [],
  },
  patients: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: false,
    unique: false,
    default: [],
  },
  hospitalGroupId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: false,
    default: null,
  },
})

export default mongoose.model<IHospital>('Hospital', HospitalSchema)
