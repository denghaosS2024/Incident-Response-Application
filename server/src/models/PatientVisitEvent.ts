// src/models/PatientVisitEvent.ts
import mongoose, { Document, Schema } from "mongoose";
import {
  BreathingState,
  ConsciousnessState,
  IVisitLog,
  LocationType,
  MedicalCondition,
  VisitLogPriority,
} from "./Patient";

export type VisitLogField =
  | "priority"
  | "location"
  | "age"
  | "conscious"
  | "breathing"
  | "chiefComplaint"
  | "condition"
  | "drugs"
  | "allergies"
  | "active"; // discharged or not

export type VisitLogValue =
  | VisitLogPriority
  | LocationType
  | number
  | ConsciousnessState
  | BreathingState
  | string
  | MedicalCondition
  | string[] // for drugs or allergies
  | boolean; // for active

export interface IFieldChange {
  field: VisitLogField;
  newValue: VisitLogValue;
}

export interface IPatientVisitEvent extends Document {
  patientId: string;
  visitLogId: string;
  changes: IFieldChange[];
  snapshot: IVisitLog;
  updatedBy: string;
  timestamp: Date;
}

const FieldChangeSchema = new Schema<IFieldChange>(
  {
    field: {
      type: String,
      required: true,
      enum: [
        "priority",
        "location",
        "age",
        "conscious",
        "breathing",
        "chiefComplaint",
        "condition",
        "drugs",
        "allergies",
        "active",
      ] as ReadonlyArray<VisitLogField>,
    },
    newValue: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const PatientVisitEventSchema = new Schema<IPatientVisitEvent>(
  {
    patientId: { type: String, required: true, index: true },
    visitLogId: { type: String, required: true, index: true },
    changes: { type: [FieldChangeSchema], required: true },
    snapshot: {
      type: Object,
      required: true,
    },
    updatedBy: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: "patientVisitEvents",
    timestamps: false,
  },
);

export default mongoose.model<IPatientVisitEvent>(
  "PatientVisitEvent",
  PatientVisitEventSchema,
);
