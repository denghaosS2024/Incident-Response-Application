import { Router, Request, Response } from 'express';
import CarController from '../controllers/CarController';

const carRouter = Router();

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     description: Retrieves a list of all available cars sorted by name.
 *     tags:
 *       - Cars
 *     responses:
 *       200:
 *         description: A list of cars retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Car"
 *       500:
 *         description: Server error while fetching cars.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const cars = await CarController.getAllCars();
    res.json(cars);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     description: Adds a new car to the system.
 *     tags:
 *       - Cars
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Car123"
 *                 description: The name of the car to add.
 *     responses:
 *       201:
 *         description: Car successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Car"
 *       400:
 *         description: Invalid input or missing car name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newCar = await CarController.createCar(name);
    res.status(201).json(newCar);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     description: Removes a car from the system by its ID.
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the car.
 *     responses:
 *       200:
 *         description: Car successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Car deleted"
 *                 car:
 *                   $ref: "#/components/schemas/Car"
 *       400:
 *         description: Invalid car ID or car not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removedCar = await CarController.removeCarById(id);
    res.json({ message: "Car deleted", car: removedCar });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

export default carRouter;
