import { Schema, model, Document } from "mongoose";

export interface ITruck extends Document {
  name: string;
}

const TruckSchema = new Schema<ITruck>({
  name: { type: String, required: true },
});

export default model<ITruck>("Truck", TruckSchema);
