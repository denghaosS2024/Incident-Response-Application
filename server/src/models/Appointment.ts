import { Document, Schema, model } from "mongoose";

// Severity index:
// 0: Low
// 1: Medium
// 2: High
// 3: Emergency
type SeverityIndex = 0 | 1 | 2 | 3;

export interface IAppointment extends Document {
  // Per team 1's discussion, we will use Citizen's ID rather than patient's ID
  userId: string;
  username: string;
  // This is nurse's Citizen ID
  nurseId: string | undefined;
  createDate: Date;
  updateDate: Date;
  closedDate: Date | undefined;
  dayOfWeek: number;
  isResolved: boolean;
  issueName: string;
  note: string | undefined;
  severityIndex: SeverityIndex;
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
  username: {
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
  isResolved: {
    type: Boolean,
    default: false,
    required: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
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
    max: 3,
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
});

export const Appointment = model<IAppointment>(
  "Appointment",
  AppointmentSchema,
);
