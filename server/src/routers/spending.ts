import { Request, Response, Router } from "express";
import SpendingController from "../controllers/SpendingController";
const spendingRouter = Router();

spendingRouter
  /**
   * @swagger
   * /api/spendings:
   *   get:
   *     summary: Get spendings by incidentId
   *     description: Retrieves a list of spendings associated with a specific incident.
   *     tags:
   *       - Spendings
   *     parameters:
   *       - in: query
   *         name: incidentId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the incident for which to fetch spendings.
   *     responses:
   *       200:
   *         description: A list of spendings retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Spending"
   *       500:
   *         description: Server error while fetching spendings.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
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
  });

export default spendingRouter;
