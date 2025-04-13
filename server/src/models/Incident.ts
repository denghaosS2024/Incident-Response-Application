import mongoose, { Document, Schema, Types } from "mongoose";
import {
  EmergencyQuestions,
  FireQuestions,
  MedicalQuestions,
  PoliceQuestions,
} from "../utils/types";
import { IUser } from "./User";

export enum IncidentType {
  Fire = "F",
  Medical = "M",
  Police = "P",
  Unset = "U",
  Sar = "S",
}
export interface IIncidentStateHistory {
  timestamp: Date;
  commander: string;
  incidentState: string;
  role: string;
}
export enum IncidentState {
  Waiting = "Waiting",
  Triage = "Triage",
  Assigned = "Assigned",
  Closed = "Closed",
}
export enum IncidentPriority {
  Immediate = "E",
  Urgent = "One",
  CouldWait = "Two",
  Dismiss = "Three",
  Unset = "U",
}

// All dedicated field for 'SAR Task' goes here
//   Note: SAR Task/SAR Incident is special type of Incident
export interface ISarTask {
  state: "Todo" | "InProgress" | "Done";
  startDate?: Date;
  endDate?: Date;
  hazards: string[];
  victims: number[]; // Array of size 5, {Immediate, Urgent, Could Wait, Dismiss, Deceased}
  name?: string;
  description?: string;
  address?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IIncident extends Document {
  incidentId: string;
  caller?: string;
  openingDate: Date;
  closingDate?: Date;
  incidentState: IncidentState;
  /*
     TODO in the future: when the app is deployed we can create reserved user System
     and replace String with type of User (same with commander)
     */
  owner: string;
  commander: string;
  commanderDetail: IUser;
  address: string;
  type: IncidentType;
  questions:
    | MedicalQuestions[]
    | FireQuestions
    | PoliceQuestions
    | EmergencyQuestions
    | null;
  priority: IncidentPriority; // The priority of the incident
  incidentCallGroup?: Types.ObjectId | null; // Reference to Channel model
  assignedVehicles: {
    type: "Car" | "Truck";
    name: string;
    usernames: string[];
  }[];
  assignHistory?: {
    timestamp: Date;
    name: string;
    type: string;
    isAssign: boolean;
    usernames: string[];
    user?: IUser | null;
  }[];
  incidentStateHistory?: IIncidentStateHistory[];
  respondersGroup?: Types.ObjectId | null; // Reference to Channel model
  sarTasks?: ISarTask[]; // Changed from sarTask to sarTasks as an array
  patients?: IPatientVisitInfo[] | undefined;
}
export interface IPatientVisitInfo {
  username: string;
  status: string | undefined;
  dateTime: string;
}
const IncidentSchema = new Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
  },
  caller: {
    type: String,
    required: false,
  },
  openingDate: {
    type: Date,
    default: Date.now,
  },
  closingDate: {
    type: Date,
    default: null,
  },
  incidentState: {
    type: String,
    required: true,
    enum: ["Waiting", "Triage", "Assigned", "Closed"],
    default: "Waiting",
  },
  owner: {
    type: String,
    required: true,
    default: "System",
  },
  commander: {
    type: String,
    required: true,
    default: "System",
  },
  address: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
    enum: Object.values(IncidentType),
  },
  priority: {
    type: String,
    required: false,
    enum: Object.values(IncidentPriority),
  },
  questions: {
    type: Schema.Types.Mixed, // Allows for different types of object but no strict type validation. This could be changed
    required: false,
  },
  incidentCallGroup: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: false,
    default: null,
  },
  assignedVehicles: {
    type: [
      {
        type: { type: String, enum: ["Car", "Truck"] },
        name: { type: String },
        usernames: { type: [String] },
      },
    ],
    default: [],
  },
  assignHistory: {
    type: [
      {
        timestamp: { type: Date, required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ["Car", "Truck"] },
        isAssign: { type: Boolean, required: true },
        usernames: { type: [String], required: true },
      },
    ],
    default: [],
  },
  incidentStateHistory: {
    type: [
      {
        timestamp: { type: Date, required: true },
        commander: { type: String, required: true },
        role: { type: String, required: true },
        incidentState: {
          type: String,
          enum: ["Waiting", "Triage", "Assigned", "Closed"],
          required: true,
        },
      },
    ],
    default: [],
  },
  respondersGroup: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    default: null,
  },
  sarTasks: {
    type: [
      {
        state: {
          type: String,
          enum: ["Todo", "InProgress", "Done"],
          default: "Todo",
        },
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
        hazards: {
          type: [String],
          default: [],
        },
        victims: {
          type: [Number],
          default: [0, 0, 0, 0, 0],
        },
        name: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        location: {
          type: String,
          default: "",
        },
        coordinates: {
          type: {
            latitude: {
              type: Number,
            },
            longitude: {
              type: Number,
            },
          },
          default: null,
        },
      },
    ],
    required: false,
    default: null,
  },
  patients: {
    type: [
      {
        username: { type: String, required: true },
        status: { type: String, required: true },
        dateTime: { type: String, required: true },
      },
    ],
    default: [],
  },
});

/**
 * Auto-generate `incidentId` if not provided
 * (e.g., "IZoe" for a caller named "Zoe")
 */
IncidentSchema.pre("save", function (next): void {
  if (!this.incidentId && this.caller) {
    this.incidentId = `I${this.caller}`;
  }
  next();
});

export default mongoose.model<IIncident>("Incident", IncidentSchema);
