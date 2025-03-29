import { Request, Response, Router } from 'express';
import AirQualityController from '../controllers/AirQualityController';

const airQualityRouter = Router();

/**
 * @swagger
 * /api/airQuality:
 *   get:
 *     summary: Get air quality data for specific coordinates
 *     tags: [Air Quality]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: numbers
 *         required: true
 *         description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Air quality data retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
airQualityRouter.get("/", async (req: Request, res: Response) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    try {
        const result = await AirQualityController.getAirQuality(lat, lon);
        return res.json(result);
    } catch (err) {
        const error = err as Error;
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/airQuality/all:
 *   get:
 *     summary: Get all air quality records for a specific location
 *     tags: [Air Quality]
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Location identifier
 *     responses:
 *       200:
 *         description: Air quality records retrieved successfully
 *       400:
 *         description: Location ID is required
 *       500:
 *         description: Server error
 */
airQualityRouter.get("/all", async (req: Request, res: Response) => {
    try {
        const { locationId } = req.query;
        
        if (!locationId) {
            return res.status(400).json({ error: 'Location ID is required' });
        }
        
        const result = await AirQualityController.getAllAirQuality(locationId as string);
        return res.json(result);
    } catch (err) {
        const error = err as Error;
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/airQuality:
 *   post:
 *     summary: Add new air quality data
 *     tags: [Air Quality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               air_quality:
 *                 type: object
 *               timeStamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Air quality data added successfully
 *       500:
 *         description: Server error
 */
airQualityRouter.post("/", async (req: Request, res: Response) => {
    const { locationId, latitude, longitude, air_quality, timeStamp } = req.body;
    try {
        const result = await AirQualityController.addAirQuality(locationId, latitude, longitude, air_quality, timeStamp);
        return res.json(result);
    } catch (err) {
        const error = err as Error;
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/airQuality:
 *   delete:
 *     summary: Delete air quality data for a location
 *     tags: [Air Quality]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Air quality data deleted successfully
 *       500:
 *         description: Server error
 */
airQualityRouter.delete("/", async (req: Request, res: Response) => {
    const { locationId } = req.body;
    try {
        const result = await AirQualityController.deleteAirQuality(locationId);
        return res.json(result);
    } catch (err) {
        const error = err as Error;
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/airQuality/MeasurementQuality:
 *   get:
 *     summary: Get measurement quality for specific coordinates
 *     tags: [Air Quality]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Measurement quality data retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
airQualityRouter.get("/MeasurementQuality", async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({ error: 'Invalid latitude or longitude' });
        }

        const result = await AirQualityController.getMeasurementQuality(lat, lon);
        return res.json(result);
    } catch (err) {
        const error = err as Error;
        return res.status(500).json({ error: error.message });
    }

})
export default airQualityRouter;