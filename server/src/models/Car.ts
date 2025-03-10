import { Document, Schema, model } from "mongoose";

export interface ICar extends Document {
  name: string;
  assignedCity?: string | null;
}

const CarSchema = new Schema<ICar>({
  name: { type: String, required: true },
  assignedCity: { type: String, default: null },
});

export default model<ICar>("Car", CarSchema);
