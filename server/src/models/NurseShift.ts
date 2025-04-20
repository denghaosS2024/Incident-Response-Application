import mongoose, { Document, Schema } from "mongoose";

/**
 * One nurse can have multiple shifts (one time slot per document)
 */
export interface INurseShift extends Document {
  // This is nurse's Citizen ID
  nurseId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  valid: boolean;
}

const NurseShiftSchema = new Schema({
  nurseId: {
    type: String,
    required: true,
  },
  valid: {
    type: Boolean,
    default: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23,
  },

  // Must be greater than startHour
  // 24 is reserved for 12AM
  endHour: {
    type: Number,
    required: true,
    min: 0,
    max: 24,
  },
});

export default mongoose.model<INurseShift>("NurseShift", NurseShiftSchema);
