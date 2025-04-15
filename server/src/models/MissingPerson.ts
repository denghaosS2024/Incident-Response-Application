import mongoose, { Document, Schema } from "mongoose";

export interface IMissingPerson extends Document {
  id: Schema.Types.ObjectId;
  name: string;
}

const MissingPersonSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: false,
  },
});

export default mongoose.model<IMissingPerson>(
  "MissingPerson",
  MissingPersonSchema,
);
