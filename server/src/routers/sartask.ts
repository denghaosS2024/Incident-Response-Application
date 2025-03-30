import { Request, Response, Router } from 'express';
import TaskController from '../controllers/SarTaskController';

const taskRouter = Router()

taskRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tasks = await TaskController.getAllTasks();
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
taskRouter.get('/notdone', async (_req: Request, res: Response) => {
  try {
    const tasks = await TaskController.getNotDoneTasks();
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});taskRouter.get('/done', async (_req: Request, res: Response) => {
  try {
    const tasks = await TaskController.getDoneTasks();
    res.json(tasks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});
export default taskRouter;
