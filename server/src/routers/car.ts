/**
 * Car Routes
 *
 * Provides endpoints for managing cars.
 */

import { Router, Request, Response } from 'express';
import CarController from '../controllers/CarController';

const carRouter = Router();

// GET /api/cars
carRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const cars = await CarController.getAllCars();
    res.json(cars);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cars
carRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newCar = await CarController.createCar(name);
    res.status(201).json(newCar);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/cars/:id
carRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removedCar = await CarController.removeCarById(id);
    res.json({ message: 'Car deleted', car: removedCar });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

export default carRouter;
