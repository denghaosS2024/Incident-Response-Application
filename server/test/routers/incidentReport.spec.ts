import request from "supertest";
import app from "../../src/app";
import IncidentReport from "../../src/models/IncidentReport";
import * as TestDatabase from "../utils/TestDatabase";

describe("IncidentReport Routes", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
    await IncidentReport.deleteMany({});
  });

  afterAll(async () => {
    await IncidentReport.deleteMany({});
    await TestDatabase.close();
  });

  beforeEach(async () => {
    await IncidentReport.deleteMany({});
  });

  describe("POST /api/incidentReports", () => {
    it("should create a new report successfully", async () => {
      const reportData = {
        incidentId: "INC-1001",
        effectiveness: 4,
        resourceAllocation: 5,
        team: [
          { name: "Alice", rating: 4 },
          { name: "Bob", rating: 5 },
        ],
        additionalInfo: "Handled efficiently",
      };

      const response = await request(app)
        .post("/api/incidentReports")
        .send(reportData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.incidentId).toBe(reportData.incidentId);
      expect(response.body.team.length).toBe(2);
    });

    it("should update an existing report", async () => {
      const initialData = {
        incidentId: "INC-1002",
        effectiveness: 3,
        resourceAllocation: 3,
        team: [],
        additionalInfo: "",
      };

      await IncidentReport.create(initialData);

      const updateData = {
        ...initialData,
        effectiveness: 5,
        additionalInfo: "Updated info",
      };

      const response = await request(app)
        .post("/api/incidentReports")
        .send(updateData)
        .expect(201);

      expect(response.body.effectiveness).toBe(5);
      expect(response.body.additionalInfo).toBe("Updated info");
    });

    it("should return 400 if incidentId is missing", async () => {
      const invalidData = {
        effectiveness: 4,
        resourceAllocation: 4,
        team: [],
        additionalInfo: "Missing incident ID",
      };

      const response = await request(app)
        .post("/api/incidentReports")
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain("incidentId is required");
    });
  });

  describe("GET /api/incidentReports/:incidentId", () => {
    it("should return the correct report", async () => {
      const report = await IncidentReport.create({
        incidentId: "INC-2001",
        effectiveness: 4,
        resourceAllocation: 3,
        team: [{ name: "Charlie", rating: 3 }],
        additionalInfo: "Test report",
      });

      const response = await request(app)
        .get(`/api/incidentReports/${report.incidentId}`)
        .expect(200);

      expect(response.body).toHaveProperty("incidentId", "INC-2001");
      expect(response.body.effectiveness).toBe(4);
    });

    it("should return 404 if report not found", async () => {
      const response = await request(app)
        .get("/api/incidentReports/UNKNOWN-ID")
        .expect(404);

      expect(response.body).toHaveProperty("message", "Report not found");
    });

    it("should return 500 if database error occurs", async () => {
      jest.spyOn(IncidentReport, "findOne").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get("/api/incidentReports/INC-5001")
        .expect(500);

      expect(response.body).toHaveProperty("message", "Failed to fetch report");

      jest.restoreAllMocks();
    });
  });
});
