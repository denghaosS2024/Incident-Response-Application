import { Document, Schema, model } from "mongoose";

export interface ITruck extends Document {
  name: string;
  assignedCity?: string | null;
}

const TruckSchema = new Schema<ITruck>({
  name: { type: String, required: true },
  assignedCity: {type: String, default: null},
});

export default model<ITruck>("Truck", TruckSchema);
