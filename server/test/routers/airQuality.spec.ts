import express from "express";
import request from "supertest";
import AirQualityController from "../../src/controllers/AirQualityController";
import airQualityRouter from "../../src/routers/airQuality";

// Mock AirQualityController
jest.mock("../../src/controllers/AirQualityController");

// Setup express app for testing
const app = express();
app.use(express.json());
app.use("/api/airQuality", airQualityRouter);

describe("Air Quality Router", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("should return air quality data when valid coordinates are provided", async () => {
      const mockData = { aqi: 42, pollutants: { pm25: 12 } };
      (AirQualityController.getAirQuality as jest.Mock).mockResolvedValue(
        mockData,
      );

      const response = await request(app)
        .get("/api/airQuality")
        .query({ latitude: "40.7128", longitude: "-74.0060" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(AirQualityController.getAirQuality).toHaveBeenCalledWith(
        40.7128,
        -74.006,
      );
    });

    it("should return 400 if latitude or longitude is missing", async () => {
      const response = await request(app)
        .get("/api/airQuality")
        .query({ latitude: "40.7128" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Latitude and longitude are required",
      });
    });

    it("should return 400 if latitude or longitude is invalid", async () => {
      const response = await request(app)
        .get("/api/airQuality")
        .query({ latitude: "invalid", longitude: "-74.0060" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid latitude or longitude" });
    });

    it("should return 500 if controller throws an error", async () => {
      (AirQualityController.getAirQuality as jest.Mock).mockRejectedValue(
        new Error("API error"),
      );

      const response = await request(app)
        .get("/api/airQuality")
        .query({ latitude: "40.7128", longitude: "-74.0060" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "API error" });
    });
  });

  describe("GET /all", () => {
    it("should return all air quality records for a specific location", async () => {
      const mockData = [{ aqi: 42 }, { aqi: 50 }];
      (AirQualityController.getAllAirQuality as jest.Mock).mockResolvedValue(
        mockData,
      );

      const response = await request(app)
        .get("/api/airQuality/all")
        .query({ locationId: "loc123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(AirQualityController.getAllAirQuality).toHaveBeenCalledWith(
        "loc123",
      );
    });

    it("should return 400 if locationId is missing", async () => {
      const response = await request(app).get("/api/airQuality/all");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Location ID is required" });
    });
  });

  describe("POST /", () => {
    it("should add new air quality data successfully", async () => {
      const mockData = { id: "newRecord123" };
      const reqBody = {
        locationId: "loc123",
        latitude: 40.7128,
        longitude: -74.006,
        air_quality: { aqi: 42 },
        timeStamp: "2023-04-01T12:00:00Z",
      };

      (AirQualityController.addAirQuality as jest.Mock).mockResolvedValue(
        mockData,
      );

      const response = await request(app).post("/api/airQuality").send(reqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(AirQualityController.addAirQuality).toHaveBeenCalledWith(
        "loc123",
        40.7128,
        -74.006,
        { aqi: 42 },
        "2023-04-01T12:00:00Z",
      );
    });
  });

  describe("DELETE /", () => {
    it("should delete air quality data successfully", async () => {
      const mockData = { deleted: true };
      (AirQualityController.deleteAirQuality as jest.Mock).mockResolvedValue(
        mockData,
      );

      const response = await request(app)
        .delete("/api/airQuality")
        .send({ locationId: "loc123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(AirQualityController.deleteAirQuality).toHaveBeenCalledWith(
        "loc123",
      );
    });
  });

  describe("GET /MeasurementQuality", () => {
    it("should return measurement quality data when valid coordinates are provided", async () => {
      const mockData = { indexes: [{ value: 80 }] };
      (
        AirQualityController.getMeasurementQuality as jest.Mock
      ).mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/airQuality/MeasurementQuality")
        .query({ latitude: "40.7128", longitude: "-74.0060" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(AirQualityController.getMeasurementQuality).toHaveBeenCalledWith(
        40.7128,
        -74.006,
      );
    });

    it("should return 400 if latitude or longitude is missing", async () => {
      const response = await request(app)
        .get("/api/airQuality/MeasurementQuality")
        .query({ latitude: "40.7128" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Latitude and longitude are required",
      });
    });

    it("should return 400 if latitude or longitude is invalid", async () => {
      const response = await request(app)
        .get("/api/airQuality/MeasurementQuality")
        .query({ latitude: "invalid", longitude: "-74.0060" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid latitude or longitude" });
    });
  });
});
