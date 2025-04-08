import mongoose, { Document, Schema } from "mongoose";

export enum ChartType {
  Pie = "Pie",
  Bar = "Bar",
  Line = "Line",
}

export enum ChartDataType {
  IncidentType = "Incident Type",
  IncidentPriority = "Incident Priority",
  IncidentState = "Incident State",
  IncidentDuration = "Incident Duration",
  IncidentResources = "Incident Resources",
  PatientLocation = "Patient Location",
  SARTasks = "SAR Tasks",
  SARVictims = "SAR Victims",
  FirePoliceAlerts = "Fire/Police Alerts",
  AlertAcknowledgmentTime = "Alert Acknowledgment Time",
}

export interface IChart extends Document {
  userId: string;
  name: string;
  type: ChartType;
  dataType: ChartDataType;
  startDate: Date;
  endDate: Date;
}

const ChartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ChartType), required: true },
  dataType: {
    type: String,
    enum: Object.values(ChartDataType),
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

/**
 * === Incident Enum Label Mappings for Display ===
 * Used to translate short codes from Incident model
 */
export const IncidentTypeLabelMap: Record<string, string> = {
  F: "Fire",
  M: "Medical",
  P: "Police",
  S: "SAR",
  U: "Unset",
};

export const IncidentPriorityLabelMap: Record<string, string> = {
  E: "Immediate",
  One: "Urgent",
  Two: "Could Wait",
  Three: "Dismiss",
  U: "Unset",
};

export const IncidentStateLabelMap: Record<string, string> = {
  Waiting: "Waiting",
  Triage: "Triage",
  Assigned: "Assigned",
  Closed: "Closed",
};

export default mongoose.model<IChart>("Chart", ChartSchema);
