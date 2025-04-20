import { Document, Schema, model } from "mongoose";

export interface IAppointment extends Document {
  // Per team 1's discussion, we will use Citizen's ID rather than patient's ID
  userId: string;
  // This is nurse's Citizen ID
  nurseId: string | undefined;
  createDate: Date;
  updateDate: Date;
  closedDate: Date;
  isResolved: boolean;
  issueName: string;
  note: string | undefined;
  severityIndex: number;
  feedback: string | undefined;
  // "Fake" delete, set (valid) boolean to false, we can use this to filter out
  valid: boolean;
  startHour: number;
  endHour: number;
}

const AppointmentSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  nurseId: {
    type: String,
    required: false,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  },
  closedDate: {
    type: Date,
    default: null,
  },
  startHour: {
    type: Number,
    default: 0,
    min: 0,
    max: 23,
  },
  endHour: {
    type: Number,
    default: 0,
    min: 0,
    max: 23,
  },
  isResolved: {
    type: Boolean,
    default: false,
    required: true,
  },
  issueName: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  severityIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  feedback: {
    type: String,
    default: "",
  },
  valid: {
    type: Boolean,
    default: true,
    required: true,
  },
});

export const Appointment = model<IAppointment>(
  "Appointment",
  AppointmentSchema,
);
