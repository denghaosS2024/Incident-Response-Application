import PatientController from "../../src/controllers/PatientController";
import Patient from "../../src/models/Patient";
import PatientVisitEvent from "../../src/models/PatientVisitEvent";
import * as TestDatabase from "../utils/TestDatabase";

const createTestPatient = async (patientId: string, visitLog: any[] = []) => {
  return await Patient.create({
    patientId,
    username: `${patientId}-user`,
    location: "Road",
    visitLog: visitLog.map((log) => ({
      location: log.location ?? "Road",
      priority: log.priority ?? "E",
      ...log,
    })),
  });
};

describe("PatientController", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterEach(async () => {
    await Patient.deleteMany({});
    await PatientVisitEvent.deleteMany({});
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  describe("getMedicalTimeline", () => {
    it("should throw 404 if patient not found", async () => {
      await expect(
        PatientController.getMedicalTimeline("nonexistent"),
      ).rejects.toThrow(/not found/);
    });

    it("should throw error if patient has no visit logs", async () => {
      await createTestPatient("p1", []);

      await expect(PatientController.getMedicalTimeline("p1")).rejects.toThrow(
        /No visit logs exist/,
      );
    });

    it("should select active visit log when available", async () => {
      await createTestPatient("p2", [
        { _id: "logA", active: false, dateTime: new Date("2023-01-01") },
        { _id: "logB", active: true, dateTime: new Date("2024-01-01") },
      ]);

      await PatientVisitEvent.create({
        patientId: "p2",
        visitLogId: "logB",
        changes: [],
        snapshot: {},
        updatedBy: "nurse1",
        timestamp: new Date(),
      });

      const res = await PatientController.getMedicalTimeline("p2");
      expect(res.visitLogId).toBe("logB");
      expect(res.events.length).toBe(1);
    });

    it("should fall back to latest visit log if no active", async () => {
      await createTestPatient("p3", [
        { _id: "logX", active: false, dateTime: new Date("2023-01-01") },
        { _id: "logY", active: false, dateTime: new Date("2024-01-01") },
      ]);

      await PatientVisitEvent.create({
        patientId: "p3",
        visitLogId: "logY",
        changes: [],
        snapshot: {},
        updatedBy: "nurse2",
        timestamp: new Date(),
      });

      const res = await PatientController.getMedicalTimeline("p3");
      expect(res.visitLogId).toBe("logY");
      expect(res.events.length).toBe(1);
    });

    it("should use provided visitLogId if available", async () => {
      await createTestPatient("p4", [
        { _id: "log1", active: false, dateTime: new Date("2023-01-01") },
        { _id: "log2", active: true, dateTime: new Date("2024-01-01") },
      ]);

      await PatientVisitEvent.insertMany([
        {
          patientId: "p4",
          visitLogId: "log1",
          changes: [],
          snapshot: {},
          updatedBy: "nurse3",
          timestamp: new Date(),
        },
        {
          patientId: "p4",
          visitLogId: "log2",
          changes: [],
          snapshot: {},
          updatedBy: "nurse3",
          timestamp: new Date(),
        },
      ]);

      const res = await PatientController.getMedicalTimeline("p4", "log1");
      expect(res.visitLogId).toBe("log1");
      expect(res.events.length).toBe(1);
    });
  });
});
