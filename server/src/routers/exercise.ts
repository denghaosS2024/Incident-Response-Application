import { Request, Response, Router } from "express";
import ExerciseController from "../controllers/ExerciseController";

const exerciseRouter = Router();

exerciseRouter.get(
  "/user/:userId",
  async (req: Request<{ userId: string }>, res: Response) => {
    try {
      const { userId } = req.params;
      const exercises =
        await ExerciseController.getExerciseListByUserId(userId);
      return res.status(200).json(exercises);
    } catch (error) {
      console.error("Error fetching exercise list:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

exerciseRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exercise = await ExerciseController.getExerciseById(id);
    return res.status(200).json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

exerciseRouter.post("/", async (req: Request, res: Response) => {
  try {
    const exercise = await ExerciseController.createExercise(req.body);
    return res.status(201).json(exercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

exerciseRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedExercise = await ExerciseController.deleteExerciseById(id);
    if (!deletedExercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    return res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default exerciseRouter;
