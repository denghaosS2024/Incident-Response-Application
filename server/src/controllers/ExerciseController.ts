import Exercise, { IExercise } from "../models/Exercise";

class ExerciseController {
  createExercise = async (data: IExercise) => {
    const { userId, name, condition, recoveryStage, bodyRegion, blocks } = data;

    const newExercise = new Exercise({
      userId,
      name,
      condition,
      recoveryStage,
      bodyRegion,
      blocks,
    });

    await newExercise.save();
    return newExercise;
  };

  getExerciseListByUserId = async (userId: string) => {
    const exercises = await Exercise.find({ userId }).lean();
    return exercises;
  };

  getExerciseById = async (id: string) => {
    const exercise = await Exercise.findById(id).lean();
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    return exercise;
  };

  deleteExerciseById = async (id: string) => {
    const deletedExercise = await Exercise.findByIdAndDelete(id);
    if (!deletedExercise) {
      throw new Error("Exercise not found");
    }
    return deletedExercise;
  };
}

export default new ExerciseController();
