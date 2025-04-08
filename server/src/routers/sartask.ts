import { Request, Response, Router } from "express";
import TaskController from "../controllers/SarTaskController";

const taskRouter = Router();

taskRouter.post("/", async (_req: Request, res: Response) => {
  try {
    const { incidentId } = _req.body;
    const tasks = await TaskController.getAllTasks(incidentId as string);
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
taskRouter.post("/notdone", async (_req: Request, res: Response) => {
  try {
    const { incidentId } = _req.body;
    const tasks = await TaskController.getNotDoneTasks(incidentId);
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
taskRouter.post("/done", async (_req: Request, res: Response) => {
  try {
    const { incidentId } = _req.body;
    const tasks = await TaskController.getDoneTasks(incidentId);
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
taskRouter.post("/progress", async (_req: Request, res: Response) => {
  try {
    const { incidentId } = _req.body;
    const tasks = await TaskController.getProgressTasks(incidentId);
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
taskRouter.post("/todo", async (_req: Request, res: Response) => {
  try {
    const { incidentId } = _req.body;
    const tasks = await TaskController.getToDoTasks(incidentId as string);
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
export default taskRouter;
