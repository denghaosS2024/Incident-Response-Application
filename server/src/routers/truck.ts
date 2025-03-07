/**
 * Truck Routes
 *
 * Provides endpoints for managing trucks.
 */

import { Router, Request, Response } from 'express';
import TruckController from '../controllers/TruckController';

const truckRouter = Router();

// GET /api/trucks
truckRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const trucks = await TruckController.getAllTrucks();
    res.json(trucks);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trucks
truckRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newTruck = await TruckController.createTruck(name);
    res.status(201).json(newTruck);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/trucks/:id
truckRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removedTruck = await TruckController.removeTruckById(id);
    res.json({ message: 'Truck deleted', truck: removedTruck });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

export default truckRouter;
