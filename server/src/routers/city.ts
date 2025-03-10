import { Router, Request, Response } from 'express';
import CityController from '../controllers/CityController';

const cityRouter = Router();

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Get all cities
 *     description: Retrieves a list of all available cities sorted by name.
 *     tags:
 *       - Cities
 *     responses:
 *       200:
 *         description: A list of cities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/City"
 *       500:
 *         description: Server error while fetching cities.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
cityRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const cities = await CityController.getAllCities();
    res.json(cities);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities:
 *   post:
 *     summary: Create a new city
 *     description: Adds a new city to the system.
 *     tags:
 *       - Cities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mountain View"
 *                 description: The name of the city to add.
 *     responses:
 *       201:
 *         description: City successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/City"
 *       400:
 *         description: Invalid input or missing city name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
cityRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newCity = await CityController.createCity(name);
    res.status(201).json(newCity);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     summary: Delete a city
 *     description: Removes a city from the system by its ID.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the city.
 *     responses:
 *       200:
 *         description: City successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "City deleted"
 *                 city:
 *                   $ref: "#/components/schemas/City"
 *       400:
 *         description: Invalid city ID or city not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
cityRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removedCity = await CityController.removeCityById(id);
    res.json({ message: 'City deleted', city: removedCity });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

export default cityRouter;
