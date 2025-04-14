import mongoose, { Document, Schema } from "mongoose";

export type VisitLogPriority = "E" | "1" | "2" | "3" | "4";
export type PatientPriority = "e" | "could_wait" | "dismissed" | "dead";
export type LocationType = "ER" | "Road";
export type PatientStatus = "to_er" | "at_er" | "others";
export type ConsciousnessState = "Yes" | "No" | null;
export type BreathingState = "Yes" | "No" | null;
export type ERStatusType = "requesting" | "ready" | "inUse" | "discharged";

export type MedicalCondition =
  | "Allergy"
  | "Asthma"
  | "Bleeding"
  | "Broken bone"
  | "Burn"
  | "Choking"
  | "Concussion"
  | "Covid-19"
  | "Heart Attack"
  | "Heat Stroke"
  | "Hypothermia"
  | "Poisoning"
  | "Seizure"
  | "Shock"
  | "Strain"
  | "Sprain"
  | "Stroke"
  | "Others"
  | ""
  | null;

export interface IVisitLog {
  dateTime: Date;
  incidentId: string;
  priority: VisitLogPriority;
  location: LocationType;
  age?: number | null;
  conscious?: ConsciousnessState;
  breathing?: BreathingState;
  chiefComplaint?: string | null;
  condition?: MedicalCondition;
  drugs?: string[] | null;
  allergies?: string[] | null;
  active: boolean;
  hospitalId?: string | null;
  hospitalName?: string | null;
}

// Base interface without Document extension
export interface IPatientBase {
  patientId: string;
  username: string;
  name?: string;
  nameLower?: string;
  sex?: string;
  dob?: string;
  nurseId?: string;
  hospitalId?: string;
  priority?: string;
  status?: string;
  erStatus?: ERStatusType;
  visitLog?: IVisitLog[] | undefined;
  master?: Schema.Types.ObjectId; // The first responder of this patient
  location?: string;
}

// Document interface for Mongoose
export interface IPatient extends IPatientBase, Document {}

const VisitLogSchema = new Schema<IVisitLog>(
  {
    dateTime: { type: Date, required: true },
    incidentId: { type: String },
    priority: {
      type: String,
      enum: ["E", "1", "2", "3", "4"] satisfies ReadonlyArray<VisitLogPriority>,
      default: "E",
      required: true,
    },
    location: {
      type: String,
      enum: ["ER", "Road"] satisfies ReadonlyArray<LocationType>,
      required: true,
    },
    age: { type: Number },
    conscious: { type: String },
    breathing: { type: String },
    chiefComplaint: { type: String },
    condition: {
      type: String,
      enum: [
        "Allergy",
        "Asthma",
        "Bleeding",
        "Broken bone",
        "Burn",
        "Choking",
        "Concussion",
        "Covid-19",
        "Heart Attack",
        "Heat Stroke",
        "Hypothermia",
        "Poisoning",
        "Seizure",
        "Shock",
        "Strain",
        "Sprain",
        "Stroke",
        "Others",
        "",
      ],
      required: false,
    },
    drugs: { type: [String], default: undefined },
    allergies: { type: [String], default: undefined },
    active: { type: Boolean, default: true },
    hospitalId: { type: String, default: undefined },
    hospitalName: { type: String, default: undefined },
  },
  { _id: false },
);

export const PatientSchema = new Schema({
  patientId: { type: String, required: true, unique: true },

  /**
   * Username of the patient
   */
  username: { type: String, required: true },

  /**
   * Name of the patient
   */
  name: { type: String },

  /**
   * Lowercase name of the patient. Used for searching.
   */
  nameLower: { type: String },

  /**
   * Sex of the patient
   */
  sex: { type: String },

  /**
   * DoB of the patient
   */
  dob: { type: String },

  /**
   * Nurse ID, should be A user's _id that is a nurse
   */
  nurseId: { type: String },

  /**
   * Hospital ID, should be a hospital's _id
   */
  hospitalId: { type: String },

  /**
   * Priority of the patient, which is a string in enum ['e', 'could_wait', 'dismissed', 'dead']
   */
  priority: {
    type: String,
    enum: [
      "e",
      "could_wait",
      "dismissed",
      "dead",
    ] satisfies ReadonlyArray<PatientPriority>,
  },

  /**
   * Status of the patient, which is a string in enum ['to_er', 'at_er', 'others']
   */
  status: {
    type: String,
    enum: ["to_er", "at_er", "others"] satisfies ReadonlyArray<PatientStatus>,
  },

  /**
   * ER status of the patient, which determines the category for the nurse view
   */
  erStatus: {
    type: String,
    enum: [
      "requesting",
      "ready",
      "inUse",
      "discharged",
    ] satisfies ReadonlyArray<ERStatusType>,
    default: "requesting",
  },

  /**
   * Patient visit log array
   */
  visitLog: { type: [VisitLogSchema], default: [], required: true },

  /**
   * Master (first responder) of the patient
   */
  master: { type: Schema.Types.ObjectId, ref: "User" },

  location: {
    type: String,
    enum: ["ER", "Road"] satisfies ReadonlyArray<LocationType>
  },
});

export default mongoose.model<IPatient>("Patient", PatientSchema);
