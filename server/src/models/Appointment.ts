import { Document, Schema, model } from "mongoose";

export interface IAppointment extends Document {
  // Per team 1's discussion, we will use Citizen's ID rather than patient's ID
  userId: string;
  // This is nurse's Citizen ID
  nurseId: string;
  createDate: Date;
  updateDate: Date;
  closedDate: Date;
  note: string;
  severityIndex: number;
}

const AppointmentSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  nurseId: {
    type: String,
    required: true,
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
});

export const Appointment = model<IAppointment>(
  "Appointment",
  AppointmentSchema,
);
