/**
 * Truck Routes
 *
 * Provides endpoints for managing trucks.
 */

import { Router } from 'express';
import TruckController from '../controllers/TruckController';

const truckRouter = Router();

// GET /api/trucks
truckRouter.get('/', async (_req, res) => {
  try {
    const trucks = await TruckController.getAllTrucks();
    res.json(trucks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trucks
truckRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newTruck = await TruckController.createTruck(name);
    res.status(201).json(newTruck);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/trucks/:id
truckRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removedTruck = await TruckController.removeTruckById(id);
    res.json({ message: 'Truck deleted', truck: removedTruck });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default truckRouter;
