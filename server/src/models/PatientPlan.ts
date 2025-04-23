import mongoose, { Schema, Document } from "mongoose"

export interface IMedicationPlan {
  name: string
  frequency: string
  timeOfDay: string
  route: string
  notes: string
}

export interface IPatientPlan extends Document {
  patientId: string
  medications: IMedicationPlan[]
  exercises: any[]
}

const MedicationPlanSchema = new Schema<IMedicationPlan>(
  {
    name: { type: String, required: true },
    frequency: String,
    timeOfDay: String,
    route: String,
    notes: String,
  },
  { _id: false }
)

const PatientPlanSchema = new Schema<IPatientPlan>({
  patientId: { type: String, required: true, unique: true },
  medications: [MedicationPlanSchema],
  exercises: {
    type: [Schema.Types.Mixed as any],
    default: [],
  }  
})

export default mongoose.model<IPatientPlan>("PatientPlan", PatientPlanSchema)
