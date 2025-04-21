export interface IExercise {
  _id: string;
  userId: string;
  name: string;
  condition:
    | "Stroke"
    | "Joint Surgery"
    | "Fracture Recovery"
    | "Musculoskeletal Pain"
    | "Chronic Disease Management"
    | "General Mobility Decline"
    | "Deconditioning"
    | "Post-surgical Recovery"
    | "Diabetic Foot Care";
  recoveryStage: "Early Stage" | "Mid Stage" | "Late Stage";
  bodyRegion:
    | "Upper Body"
    | "Lower Body"
    | "Core/Trunk"
    | "Full Body"
    | "Not Specific";

  blocks: IExerciseBlock[];
}

export interface IExerciseBlock {
  guide: string;
  videoUrl: string;
}
