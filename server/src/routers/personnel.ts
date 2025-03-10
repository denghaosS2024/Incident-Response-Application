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

/**
 * @swagger
 * /api/personnel/cities:
 *   put:
 *     summary: Update the assigned city for a personnel
 *     description: Assigns or removes a personnel from a city.
 *     tags:
 *       - Personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - cityName
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               cityName:
 *                 type: string
 *                 example: "San Francisco"
 *                 description: Name of the city to assign. Pass `null` to remove personnel from a city.
 *     responses:
 *       200:
 *         description: Personnel updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Personnel"
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: Personnel or city not found.
 *       500:
 *         description: Server error while updating personnel.
 */
personnelRouter.put("/cities", async (req: Request, res: Response) => {
  try {
    const { username, cityName } = req.body;
    console.log('username:', username);
    console.log('cityName:', cityName);
    const updatedPersonnel = await PersonnelController.updatePersonnelCity(username, cityName);
    res.status(200).json(updatedPersonnel);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

export default personnelRouter;
