import mongoose, { Schema, Document } from 'mongoose'

export interface ICheckIn extends Document {
  userId: string
  exerciseId: string
  date: string 
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: { type: String, required: true },
    exerciseId: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model<ICheckIn>('CheckIn', CheckInSchema)
