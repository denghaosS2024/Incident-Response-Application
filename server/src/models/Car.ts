import { Schema, model, Document } from "mongoose";

export interface ICar extends Document {
  name: string;
}

const CarSchema = new Schema<ICar>({
  name: { type: String, required: true },
});

export default model<ICar>("Car", CarSchema);
