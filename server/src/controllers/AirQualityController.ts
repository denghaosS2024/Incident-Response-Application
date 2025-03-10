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

        // Build query parameters (pm2.5_atm outdoor sensors data, cf1 indoor sensors data)
        const params = new URLSearchParams({
            fields: 'latitude, longitude, pm2.5_atm',
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
        // fields: [ 'sensor_index', 'latitude', 'longitude', 'pm2.5_atm' ]
        const sensors = data.data;

        if (!sensors || sensors.length === 0) {
            return { air_quality: 'unknown', message: 'No sensors found within 10 miles' };
        }

        // Map sensors with distance from target location
        const sensorsWithDistance = sensors.map(sensor => {
            const [, sensorLat, sensorLon, pm25] = sensor;
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
            air_quality: aqiFromPM(averagePm25.toFixed(2)),
            sensor_count: nearestSensors.length,
            sensors_used: nearestSensors.map(s => ({
                latitude: s.latitude,
                longitude: s.longitude,
                pm25: aqiFromPM(s.pm25),
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

// Helper function to calculate US EPA AQI from PM2.5
function aqiFromPM(pm) {
    if (isNaN(pm)) return "-"; 
    if (pm == undefined) return "-";
    if (pm < 0) return pm; 
    if (pm > 1000) return "-"; 
    /*                                  AQI         RAW PM2.5
    Good                               0 - 50   |   0.0 – 12.0
    Moderate                          51 - 100  |  12.1 – 35.4
    Unhealthy for Sensitive Groups   101 – 150  |  35.5 – 55.4
    Unhealthy                        151 – 200  |  55.5 – 150.4
    Very Unhealthy                   201 – 300  |  150.5 – 250.4
    Hazardous                        301 – 400  |  250.5 – 350.4
    Hazardous                        401 – 500  |  350.5 – 500.4
    */
    if (pm > 350.5) {
        return calcAQI(pm, 500, 401, 500.4, 350.5); //Hazardous
    } else if (pm > 250.5) {
        return calcAQI(pm, 400, 301, 350.4, 250.5); //Hazardous
    } else if (pm > 150.5) {
        return calcAQI(pm, 300, 201, 250.4, 150.5); //Very Unhealthy
    } else if (pm > 55.5) {
        return calcAQI(pm, 200, 151, 150.4, 55.5); //Unhealthy
    } else if (pm > 35.5) {
        return calcAQI(pm, 150, 101, 55.4, 35.5); //Unhealthy for Sensitive Groups
    } else if (pm > 12.1) {
        return calcAQI(pm, 100, 51, 35.4, 12.1); //Moderate
    } else if (pm >= 0) {
        return calcAQI(pm, 50, 0, 12, 0); //Good
    } else {
        return undefined;
    }
}

function calcAQI(Cp, Ih, Il, BPh, BPl) {
    var a = (Ih - Il);
    var b = (BPh - BPl);
    var c = (Cp - BPl);
    return Math.round((a/b) * c + Il);
}

export default new AirQualityController();