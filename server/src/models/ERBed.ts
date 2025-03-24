import mongoose, { Document, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

/**
 * ERBed status enum
 * REQUESTED: A bed has been requested for a patient
 * READY: A bed is ready for a patient
 * IN_USE: The patient is in the bed
 * DISCHARGED: The patient has been discharged from the bed
 */
export enum ERBedStatus {
  REQUESTED = 'requested',
  READY = 'ready',
  IN_USE = 'in_use',
  DISCHARGED = 'discharged',
}

export interface IERBed extends Document {
  bedId: string
  hospitalId: string
  patientId?: string
  status: ERBedStatus
  requestedAt?: Date
  readyAt?: Date
  occupiedAt?: Date
  dischargedAt?: Date
  requestedBy?: string // User ID who requested the bed
}

const ERBedSchema = new Schema(
  {
    bedId: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    hospitalId: {
      type: String,
      required: true,
      ref: 'Hospital',
    },
    patientId: {
      type: String,
      required: false,
      ref: 'Patient',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ERBedStatus),
      default: ERBedStatus.READY,
    },
    requestedAt: {
      type: Date,
      required: false,
    },
    readyAt: {
      type: Date,
      required: false,
    },
    occupiedAt: {
      type: Date,
      required: false,
    },
    dischargedAt: {
      type: Date,
      required: false,
    },
    requestedBy: {
      type: String,
      required: false,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IERBed>('ERBed', ERBedSchema)
