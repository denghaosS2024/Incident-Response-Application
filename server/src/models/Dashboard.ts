import mongoose, { Document, Schema } from 'mongoose';

export enum ChartType {
  Pie = 'Pie',
  Bar = 'Bar',
  Line = 'Line',
}

export enum ChartDataType {
  IncidentType = 'Incident Type',
  IncidentPriority = 'Incident Priority',
  IncidentState = 'Incident State',
  IncidentDuration = 'Incident Duration',
  IncidentResources = 'Incident Resources',
  PatientLocation = 'Patient Location',
  SARTasks = 'SAR Tasks',
  SARVictims = 'SAR Victims',
  FirePoliceAlerts = 'Fire/Police Alerts',
  AlertAcknowledgmentTime = 'Alert Acknowledgment Time',
}

export interface IChart extends Document {
  userId: string; // Reference to User
  name: string; // User-defined chart name
  type: ChartType; // Pie, Bar, Line
  dataType: ChartDataType; // The category of data being visualized
  startDate: Date; // User-defined start date
  endDate: Date; // User-defined end date
}

const ChartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ChartType), required: true },
  dataType: { type: String, enum: Object.values(ChartDataType), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export default mongoose.model<IChart>('Chart', ChartSchema);
