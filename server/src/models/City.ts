import { Document, Schema, model } from "mongoose";

export interface ICity extends Document {
  name: string;
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  // add more fields as needed
});

export default model<ICity>("City", CitySchema);
