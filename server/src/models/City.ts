import { Document, Schema, model } from "mongoose";

export interface ICity extends Document {
  name: string;
  fireFunding: number;
  policeFunding: number;

}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  // add more fields as needed
  fireFunding: { type: Number, default: 0 },
  policeFunding: { type: Number, default: 0 },
});

export default model<ICity>("City", CitySchema);
