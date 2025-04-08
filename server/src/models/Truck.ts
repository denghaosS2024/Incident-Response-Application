import { Document, Schema, model } from "mongoose";

export interface ITruck extends Document {
  name: string;
  assignedCity?: string | null;
  usernames?: string[] | [];
  assignedIncident?: string | null;
}

const TruckSchema = new Schema<ITruck>({
  name: { type: String, required: true, unique: true },
  assignedCity: { type: String, default: null },
  usernames: { type: [String], default: [] },
  assignedIncident: { type: String, default: null },
});

export default model<ITruck>("Truck", TruckSchema);
