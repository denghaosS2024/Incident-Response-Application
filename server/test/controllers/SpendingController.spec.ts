import SpendingController from "../../src/controllers/SpendingController";
import Spending from "../../src/models/Spending";
import * as TestDatabase from "../utils/TestDatabase";

describe("SpendingController", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    await Spending.deleteMany({});
  });

  describe("getSpendingsByIncidentId", () => {
    it("should return all spendings by IncidentId", async () => {
      const spendings = [
        { incidentId: "1", amount: 100, date: new Date(), reason: "Fuel" },
        { incidentId: "2", amount: 200, date: new Date(), reason: "Food" },
      ];
      await Spending.insertMany(spendings);

      const result = await SpendingController.getSpendingsByIncidentId("1");

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100);
    });

    it("should return error if fetching spendings fails", async () => {
      jest.spyOn(Spending, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(
        SpendingController.getSpendingsByIncidentId("1"),
      ).rejects.toThrow("Database error");
    });

    it("should throw an error if incidentId is not provided", async () => {
      await expect(
        SpendingController.getSpendingsByIncidentId(""),
      ).rejects.toThrow("Incident ID is required");
    });
  });

  describe("createSpending", () => {
    it("should create a new spending", async () => {
      const spendingData = {
        incidentId: "1",
        amount: 100,
        date: new Date(),
        reason: "Fuel",
      };

      const result = await SpendingController.createSpending(
        spendingData.incidentId,
        spendingData.amount,
        spendingData.date,
        spendingData.reason,
      );

      expect(result).toHaveProperty("_id");
    });

    it("should throw an error if required fields are missing", async () => {
      await expect(
        SpendingController.createSpending("", 100, new Date(), "Fuel"),
      ).rejects.toThrow("All fields are required");
    });

    it("should throw an error if database operation fails", async () => {
      jest.spyOn(Spending.prototype, "save").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(
        SpendingController.createSpending("1", 100, new Date(), "Fuel"),
      ).rejects.toThrow("Database error");
    });
  });
});
