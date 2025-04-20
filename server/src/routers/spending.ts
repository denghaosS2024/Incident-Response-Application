import { Request, Response, Router } from "express";
import SpendingController from "../controllers/SpendingController";
const spendingRouter = Router();

spendingRouter
  .get("/", async (req: Request, res: Response) => {
    try {
      const { incidentId } = req.query;
      if (incidentId) {
        const spendings = await SpendingController.getSpendingsByIncidentId(
          incidentId as string,
        );
        res.json(spendings);
        return;
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  })
  .post("/", async (req: Request, res: Response) => {
    try {
      const { incidentId, amount, date, reason } = req.body;
      if (!incidentId || !amount || !date || !reason) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const spending = await SpendingController.createSpending(
        incidentId,
        amount,
        date,
        reason,
      );
      return res.status(201).json(spending);
    } catch (err) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  });

export default spendingRouter;
