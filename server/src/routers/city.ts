/**
 * City Routes
 *
 * Provides endpoints for managing cities.
 */

import { Router } from 'express';
import CityController from '../controllers/CityController';

const cityRouter = Router();

// GET /api/cities
cityRouter.get('/', async (_req, res) => {
  try {
    const cities = await CityController.getAllCities();
    res.json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cities
cityRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newCity = await CityController.createCity(name);
    res.status(201).json(newCity);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cities/:id
cityRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removedCity = await CityController.removeCityById(id);
    res.json({ message: 'City deleted', city: removedCity });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default cityRouter;
