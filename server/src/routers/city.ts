/**
 * City Routes
 *
 * Provides endpoints for managing cities.
 */

import { Router, Request, Response } from 'express';
import CityController from '../controllers/CityController';

const cityRouter = Router();

// GET /api/cities
cityRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const cities = await CityController.getAllCities();
    res.json(cities);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cities
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

// DELETE /api/cities/:id
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
