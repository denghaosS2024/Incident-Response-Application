import mongoose, { InferSchemaType, Schema } from "mongoose";

const ExerciseBlockSchema = new Schema({
  guide: { type: String, required: true },
  videoUrl: { type: String },
});

export type IExerciseBlock = InferSchemaType<typeof ExerciseBlockSchema>;

export const ExerciseSchema = new Schema(
  {
    userId: { type: String, required: true }, //nurseId
    name: { type: String, required: true },
    condition: {
      type: String,
      enum: [
        "Stroke",
        "Joint Surgery",
        "Fracture Recovery",
        "Musculoskeletal Pain",
        "Chronic Disease Management",
        "General Mobility Decline",
        "Deconditioning",
        "Post-surgical Recovery",
        "Diabetic Foot Care",
      ],
      required: true,
    },
    recoveryStage: {
      type: String,
      enum: ["Early Stage", "Mid Stage", "Late Stage"],
      required: true,
    },
    bodyRegion: {
      type: String,
      enum: [
        "Upper Body",
        "Lower Body",
        "Core/Trunk",
        "Full Body",
        "Not Specific",
      ],
      required: true,
    },
    blocks: { type: [ExerciseBlockSchema], required: true },
  },
  { timestamps: true },
);

export type IExercise = InferSchemaType<typeof ExerciseSchema>;

export default mongoose.model<IExercise>("Exercise", ExerciseSchema);
