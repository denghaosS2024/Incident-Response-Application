import haversine from "haversine-distance";
import fetch from "node-fetch";

const PURPLEAIR_API_URL = process.env.PURPLEAIR_API_URL + "sensors/";
const PURPLEAIR_API_KEY = process.env.PURPLEAIR_API_KEY_READ;

// 0 = Outside or 1 = Inside
const location_type = 0;

class AirQualityController {
    async getAirQuality(latitude: number, longitude: number) {
        // Ensure API key is defined
        if (!PURPLEAIR_API_KEY) {
            throw new Error('PurpleAir API key is not defined');
        }

        // Get bounding box for 10-mile radius
        const { nw, se } = getBoundingBox(latitude, longitude);

        // Build query parameters
        const params = new URLSearchParams({
            fields: 'latitude, longitude, pm2.5',
            location_type: location_type.toString(), // Outdoor sensors only
            nwlng: nw.lon.toString(),
            nwlat: nw.lat.toString(),
            selng: se.lon.toString(),
            selat: se.lat.toString(),
        });

        // Make API request to PurpleAir using fetch
        const response = await fetch(`${PURPLEAIR_API_URL}?${params}`, {
            headers: { 'X-API-Key': PURPLEAIR_API_KEY }
        });

        // console.log(response);

        if (!response.ok) {
            throw new Error(`PurpleAir API returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        const sensors = data.data;

        if (!sensors || sensors.length === 0) {
            return { air_quality: 'unknown', message: 'No sensors found within 10 miles' };
        }

        // Map sensors with distance from target location
        const sensorsWithDistance = sensors.map(sensor => {
            const [pm25, sensorLat, sensorLon] = sensor;
            const distance = calculateDistance(latitude, longitude, sensorLat, sensorLon);
            return { latitude: sensorLat, longitude: sensorLon, pm25, distance };
        });

        // Filter sensors within 10 miles
        const nearbySensors = sensorsWithDistance.filter(sensor => sensor.distance <= 10);
        if (nearbySensors.length === 0) {
            return { air_quality: 'Unknown', message: 'No sensors within 10 miles after filtering' };
        }

        // Sort by distance and take the 3 nearest
        const sortedSensors = nearbySensors.sort((a, b) => a.distance - b.distance);
        const nearestSensors = sortedSensors.slice(0, Math.min(3, sortedSensors.length));

        // Calculate average PM2.5
        const totalPm25 = nearestSensors.reduce((sum, sensor) => sum + sensor.pm25, 0);
        const averagePm25 = totalPm25 / nearestSensors.length;

        return {
            air_quality: averagePm25.toFixed(2),
            sensor_count: nearestSensors.length,
            sensors_used: nearestSensors.map(s => ({
                latitude: s.latitude,
                longitude: s.longitude,
                pm25: s.pm25,
                distance_miles: s.distance.toFixed(2),
            }))
        };
    }
}

// Helper function to calculate distance in miles between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const point1 = { latitude: lat1, longitude: lon1 };
    const point2 = { latitude: lat2, longitude: lon2 };
    const distanceMeters = haversine(point1, point2);
    return distanceMeters / 1609.34; // Convert meters to miles
}

// Helper function to get bounding box for 10-mile radius
function getBoundingBox(lat: number, lon: number, radiusMiles = 10) {
    const earthRadiusMiles = 3958.8; // Earth's radius in miles
    const latChange = (radiusMiles / earthRadiusMiles) * (180 / Math.PI);
    const lonChange = (radiusMiles / earthRadiusMiles) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

    return {
        nw: { lat: lat + latChange, lon: lon - lonChange },
        se: { lat: lat - latChange, lon: lon + lonChange }
    };
}

export default new AirQualityController();