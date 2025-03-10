import { Request, Response, Router } from "express";
import PersonnelController from "../controllers/PersonnelController";

const personnelRouter = Router();

/**
 * @swagger
 * /api/personnel:
 *   get:
 *     summary: Get all personnel
 *     description: Retrieves a list of all Firefighters and Police Officers.
 *     tags:
 *       - Personnel
 *     responses:
 *       200:
 *         description: A list of personnel retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Personnel"
 *       500:
 *         description: Server error while fetching personnel.
 */
personnelRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const personnel = await PersonnelController.getAllAvailablePersonnel();
    res.json(personnel);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});


export default personnelRouter;
