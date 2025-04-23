import request from "supertest";
import app from "../../src/app"; // Your Express app
import mongoose from "mongoose";
import PatientPlan from "../../src/models/PatientPlan";
import Exercise from "../../src/models/Exercise";
import Patient from "../../src/models/Patient";

let testPatientId: string;
let testExerciseId: string;

describe("PatientPlanController Integration + Unit Test", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test-db");

    const patient = await Patient.create({
      username: "test-user",
      name: "John Doe",
    });
    testPatientId = patient._id.toString();

    const exercise = await Exercise.create({
      userId: "nurse1",
      name: "Simple Stretch",
      condition: "Stroke",
      recoveryStage: "Early Stage",
      bodyRegion: "Upper Body",
      blocks: [{ guide: "Stretch your arms", videoUrl: "https://youtube.com" }],
    });
    testExerciseId = exercise._id.toString();
  });

  afterAll(async () => {
    await Patient.deleteMany({});
    await PatientPlan.deleteMany({});
    await Exercise.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Unit-like behavior for medication logic", () => {
    it("should add a new medication to an existing plan", async () => {
      await PatientPlan.create({ patientId: testPatientId, medications: [], exercises: [] });

      const res = await request(app)
        .post(`/api/patientPlan/${testPatientId}/medications`)
        .send({ name: "Aspirin", frequency: "1x", timeOfDay: "Morning", route: "oral", notes: "after meal" });

      expect(res.status).toBe(200);
      expect(res.body.plan.medications[0].name).toBe("Aspirin");
    });

    it("should reject update if medication index is invalid", async () => {
      const res = await request(app)
        .put(`/api/patientPlan/${testPatientId}/medications/99`)
        .send({ name: "Ibuprofen", frequency: "2x", timeOfDay: "Evening", route: "oral", notes: "with food" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid medication index");
    });
  });

  describe("Exercise update logic - Integration", () => {
    it("should update exercises when all IDs are valid", async () => {
      const res = await request(app)
        .put(`/api/patientPlan/${testPatientId}/exercises`)
        .send({ exercises: [testExerciseId] });

      expect(res.status).toBe(200);
      expect(res.body.plan.exercises[0].name).toBe("Simple Stretch");
    });

    it("should reject if exercise ID does not exist", async () => {
      const res = await request(app)
        .put(`/api/patientPlan/${testPatientId}/exercises`)
        .send({ exercises: ["507f1f77bcf86cd799439011"] }); 

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("One or more exercises not found");
    });
  });
});