import mongoose, { Document, Schema } from "mongoose";

export interface ITeamRating {
  name: string;
  rating: number;
}

export interface IIncidentReport extends Document {
  incidentId: string;
  effectiveness: number;
  resourceAllocation: number;
  team: ITeamRating[];
  additionalInfo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamRatingSchema = new Schema<ITeamRating>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { _id: false },
);

const IncidentReportSchema = new Schema<IIncidentReport>(
  {
    incidentId: { type: String, required: true, unique: true },
    effectiveness: { type: Number, required: true },
    resourceAllocation: { type: Number, required: true },
    team: { type: [TeamRatingSchema], default: [] },
    additionalInfo: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IIncidentReport>(
  "IncidentReport",
  IncidentReportSchema,
);
