import { Request, Response, Router } from "express";
import SpendingController from "../controllers/SpendingController";
const spendingRouter = Router();

spendingRouter
  /**
   * @swagger
   * /api/spendings:
   *   get:
   *     summary: Get all spendings
   *     description: Retrieves a list of all spendings sorted by date in descending order.
   *     tags:
   *       - Spendings
   *     parameters:
   *       - in: query
   *         name: incidentId
   *         required: false
   *         schema:
   *           type: string
   *         description: Filter spendings by incident ID.
   *     responses:
   *       200:
   *         description: A list of spendings retrieved successfully.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *             items:
   *               $ref: "#/components/schemas/Spending"
   *      500:
   *        description: Server error while fetching spendings.
   *       content:
   *         application/json:
   *          schema:
   *           $ref: "#/components/schemas/ErrorResponse"
   * *       400:
   *        description: Bad request due to missing or invalid parameters.
   *       content:
   *         application/json:
   *          schema:
   *           $ref: "#/components/schemas/ErrorResponse"
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
  })
  /**
   * @swagger
   * /api/spendings:
   *   post:
   *     summary: Create a new spending
   *     description: Creates a new spending entry.
   *     tags:
   *       - Spendings
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               incidentId:
   *                 type: string
   *               amount:
   *                 type: number
   *               date:
   *                 type: string
   *                 format: date-time
   *               reason:
   *                 type: string
   *     responses:
   *      201:
   *        description: Spending created successfully.
   *       content:
   *        application/json:
   *         schema:
   *          $ref: "#/components/schemas/Spending"
   *      400:
   *       description: Bad request due to missing or invalid parameters.
   *      content:
   *       application/json:
   *        schema:
   *         $ref: "#/components/schemas/ErrorResponse"
   *     500:
   *      description: Server error while creating spending.
   *     content:
   *      application/json:
   *       schema:
   *        $ref: "#/components/schemas/ErrorResponse"
   *    */
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
