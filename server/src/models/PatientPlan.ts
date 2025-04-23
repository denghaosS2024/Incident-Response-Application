import mongoose, { Document, Schema } from "mongoose";
import { ExerciseSchema, IExercise } from "./Exercise";

export interface IMedicationPlan {
  name: string;
  frequency: string;
  timeOfDay: string;
  route: string;
  notes: string;
}

export interface IPatientPlan extends Document {
  patientId: string;
  medications: IMedicationPlan[];
  exercises: IExercise[];
}

const MedicationPlanSchema = new Schema<IMedicationPlan>(
  {
    name: { type: String, required: true },
    frequency: String,
    timeOfDay: String,
    route: String,
    notes: String,
  },
  { _id: false },
);

const PatientPlanSchema = new Schema<IPatientPlan>({
  patientId: { type: String, required: true, unique: true },
  medications: [MedicationPlanSchema],
  exercises: {
    type: [ExerciseSchema],
    default: [],
  },
});

export default mongoose.model<IPatientPlan>("PatientPlan", PatientPlanSchema);
