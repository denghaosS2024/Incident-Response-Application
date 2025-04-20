import request from "supertest";
import app from "../../src/app";
import Spending from "../../src/models/Spending";
import * as TestDatabase from "../utils/TestDatabase";

describe("Spending Routes", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    await Spending.deleteMany({});
  });

  describe("GET /api/spendings", () => {
    it("should return spendings by incidentId", async () => {
      // Create test spendings in the database
      const testSpendings = [
        {
          incidentId: "INC-001",
          amount: 100,
          date: new Date(),
          reason: "Fuel",
        },
        {
          incidentId: "INC-002",
          amount: 200,
          date: new Date(),
          reason: "Food",
        },
        {
          incidentId: "INC-001",
          amount: 200,
          date: new Date(),
          reason: "Assign Car",
        },
      ];

      await Spending.insertMany(testSpendings);

      const response = await request(app)
        .get("/api/spendings")
        .query({ incidentId: "INC-001" })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].amount).toBe(100);
      expect(response.body[0].reason).toBe("Fuel");
      expect(response.body[0].incidentId).toBe("INC-001");
      expect(response.body[1].amount).toBe(200);
      expect(response.body[1].reason).toBe("Assign Car");
      expect(response.body[1].incidentId).toBe("INC-001");
    });
  });
});
