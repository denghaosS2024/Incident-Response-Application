import { Request, Response, Router } from 'express';
import AirQualityController from '../controllers/AirQualityController';

const airQualityRouter = Router();

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

export default airQualityRouter;