import { Router, Request, Response } from "express";
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
    const personnel = await PersonnelController.getAllPersonnel();
    res.json(personnel);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/personnel:
 *   post:
 *     summary: Add new personnel
 *     description: Creates a new Firefighter or Police Officer.
 *     tags:
 *       - Personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: ["Firefighter", "Police Officer"]
 *     responses:
 *       201:
 *         description: Personnel created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Personnel"
 *       400:
 *         description: Bad request, missing fields.
 */
personnelRouter.post("/", async (req: Request, res: Response) => {
    try {
      const { name, role } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: "Name and role are required" });
      }
      const newPersonnel = await PersonnelController.createPersonnel(name, role);
      return res.status(201).json(newPersonnel);
    } catch (err) {
      const error = err as Error;
      return res.status(400).json({ error: error.message });
    }
  });

/**
 * @swagger
 * /api/personnel/{id}:
 *   delete:
 *     summary: Remove personnel
 *     description: Deletes a Firefighter or Police Officer by ID.
 *     tags:
 *       - Personnel
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the personnel to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personnel deleted successfully.
 *       400:
 *         description: Invalid personnel ID or personnel not found.
 */
personnelRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removedPersonnel = await PersonnelController.removePersonnelById(id);
    res.json({ message: "Personnel deleted", personnel: removedPersonnel });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

export default personnelRouter;
