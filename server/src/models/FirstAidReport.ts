import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IFirstAidReport extends Document {
  reportId: string;
  sessionId: string;
  responderId: string;
  questions: string[];
  answers: string[];
  primarySymptom: string;
  onsetTime: string;
  severity: string;
  additionalSymptoms: string;
  remediesTaken: string;
  createdAt: Date;
  status: "generated";
}

const FirstAidReportSchema = new Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  sessionId: {
    type: String,
    required: true,
  },
  responderId: {
    type: String,
    required: true,
  },
  questions: {
    type: [String],
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  primarySymptom: {
    type: String,
    required: true,
  },
  onsetTime: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    required: true,
  },
  additionalSymptoms: {
    type: String,
    required: true,
  },
  remediesTaken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["generated"], // TODO: Add more statuses as needed
    default: "generated",
  },
});

export default mongoose.model<IFirstAidReport>(
  "FirstAidReport",
  FirstAidReportSchema,
);
