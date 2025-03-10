import { Schema, model, Document } from "mongoose";

export interface IPersonnel extends Document {
  name: string;
  role: "Firefighter" | "Police Officer";
}

const PersonnelSchema = new Schema<IPersonnel>({
  name: { type: String, required: true },
  role: { type: String, enum: ["Firefighter", "Police Officer"], required: true },
});

export default model<IPersonnel>("Personnel", PersonnelSchema);
