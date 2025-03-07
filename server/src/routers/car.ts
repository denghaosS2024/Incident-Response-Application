/**
 * Car Routes
 *
 * Provides endpoints for managing cars.
 */

import { Router } from 'express';
import CarController from '../controllers/CarController';

const carRouter = Router();

// GET /api/cars
carRouter.get('/', async (_req, res) => {
  try {
    const cars = await CarController.getAllCars();
    res.json(cars);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cars
carRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newCar = await CarController.createCar(name);
    res.status(201).json(newCar);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cars/:id
carRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removedCar = await CarController.removeCarById(id);
    res.json({ message: 'Car deleted', car: removedCar });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default carRouter;
