import { Types } from "mongoose";
import request from "supertest";

import app from "../../src/app";
import Car from "../../src/models/Car";
import Incident from "../../src/models/Incident";
import * as TestDatabase from "../utils/TestDatabase";

describe("Router - Incident", () => {
  beforeAll(TestDatabase.connect);
  const username: string = "Test";

  // Global cleanup after each test
  afterEach(async () => {
    await Incident.deleteMany({});
    await Car.deleteMany({});
  });

  afterAll(TestDatabase.close);

  // Helper function for creating a basic incident
  const createBasicIncident = () => {
    return request(app).post("/api/incidents").send({
      username,
    });
  };

  // Helper function for creating a SAR incident
  const createSarIncident = (incidentId: string) => {
    return request(app).post("/api/incidents/new").send({
      incidentId,
      caller: username,
      openingDate: new Date(),
      incidentState: "Waiting",
      owner: "System",
      commander: "System",
      incidentCallGroup: null,
      sarTasks: [],
      type: "S",
    });
  };

  // Helper function for creating a test car
  const createTestCar = async (carData: any) => {
    return await Car.create(carData);
  };

  describe("Basic Incident Operations", () => {
    it("should return 204 for get all incidents if none exist", async () => {
      await request(app).get("/api/incidents").expect(204);
    });

    it("can create a new incident", async () => {
      const { body: incident } = await createBasicIncident().expect(201);

      expect(incident).toMatchObject({
        incidentId: "ITest",
        caller: username,
        incidentState: "Waiting",
        owner: "System",
        commander: "System",
      });
    });

    it("will not allow to create a duplicate incident", async () => {
      // First create an incident
      await createBasicIncident().expect(201);
      // Try to create duplicate
      await createBasicIncident().expect(400);
    });

    it("should get active incident for user", async () => {
      // First create an incident
      await createBasicIncident().expect(201);

      const { body: activeIncident } = await request(app)
        .get(`/api/incidents/${username}/active`)
        .expect(200);

      expect(activeIncident).toMatchObject({
        incidentId: "ITest",
        caller: username,
        incidentState: "Waiting",
      });
    });

    it("should return 404 if no active incident found", async () => {
      await request(app)
        .get("/api/incidents/non-existent-user/active")
        .expect(404);
    });
  });

  describe("Chat Group Management", () => {
    let incidentId: string;

    beforeEach(async () => {
      // Create an incident for chat group tests
      const { body: incident } = await createBasicIncident().expect(201);
      incidentId = incident._id;
    });

    it("should update incident chat group", async () => {
      const channelId = new Types.ObjectId();

      const { body: updatedIncident } = await request(app)
        .put(`/api/incidents/${incidentId}/chat-group`)
        .send({ channelId: channelId.toString() })
        .expect(200);

      expect(updatedIncident.incidentCallGroup).toBe(channelId.toString());
    });

    it("should return 404 for non-existent incident", async () => {
      const nonExistentId = new Types.ObjectId();
      await request(app)
        .put(`/api/incidents/${nonExistentId}/chat-group`)
        .send({ channelId: new Types.ObjectId().toString() })
        .expect(404);
    });

    it("should return 400 for invalid channel ID", async () => {
      await request(app)
        .put(`/api/incidents/${incidentId}/chat-group`)
        .send({ channelId: "invalid-id" })
        .expect(400);
    });
  });

  describe("Vehicle Management", () => {
    let incidentId: string;
    let testCar: any;

    beforeEach(async () => {
      // Create an incident
      const { body: incident } = await createBasicIncident().expect(201);
      incidentId = incident._id;

      // Create a test car
      testCar = await createTestCar({
        name: "Police Car 1",
        usernames: ["Officer Smith"],
        assignedIncident: null,
        assignedCity: "New York",
      });
    });

    it("should add a police car to an incident", async () => {
      const personnel = {
        _id: new Types.ObjectId().toString(),
        name: "Officer Smith",
        assignedCity: "Test City",
        role: "Police" as const,
        assignedVehicleTimestamp: null,
      };

      await request(app)
        .put("/api/incidents/vehicles")
        .send({
          personnel,
          commandingIncident: { _id: incidentId },
          vehicle: testCar.toObject(),
        })
        .expect(200);

      const updatedIncident = await Incident.findById(incidentId);
      expect(updatedIncident?.assignedVehicles).toHaveLength(1);
      expect(updatedIncident?.assignedVehicles[0].name).toBe("Police Car 1");
    });

    it("should update vehicle history for given incidents", async () => {
      const updatedIncident = {
        _id: incidentId,
        incidentId: "ITest",
        assignedVehicles: [
          {
            name: "Police Car 1",
            type: "Car",
            usernames: ["Officer Smith"],
          },
        ],
      };

      const res = await request(app)
        .put("/api/incidents/updatedVehicles")
        .send({ incidents: [[updatedIncident]] })
        .expect(200);

      expect(res.body).toMatchObject({ message: "success" });

      const after = await Incident.findById(incidentId);
      expect(after?.assignHistory?.length).toBeGreaterThan(0);
      expect(after?.assignHistory?.at(-1)).toMatchObject({
        name: "Police Car 1",
        type: "Car",
        isAssign: true,
        usernames: ["Officer Smith"],
      });
    });
  });

  describe("SAR Task Management", () => {
    let incidentId: string;

    beforeEach(async () => {
      // Create a SAR incident
      const { body: incident } =
        await createSarIncident("STest020").expect(201);
      incidentId = incident.incidentId;
    });

    it("should update a SAR task for an incident", async () => {
      // Create a SAR task
      await request(app)
        .post(`/api/incidents/${incidentId}/sar-task`)
        .send({
          state: "Todo",
          location: "Test Location",
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          name: "Initial SAR Task",
          description: "Initial task for SAR incident",
        })
        .expect(200);

      // Update the SAR task
      const updatedTask = {
        state: "InProgress",
        location: "Updated Location",
        coordinates: { latitude: 37.7849, longitude: -122.4294 },
        name: "Updated SAR Task",
        description: "Updated task for SAR incident",
      };

      const { body: updatedIncident } = await request(app)
        .put(`/api/incidents/sar/${incidentId}`)
        .send({
          taskId: 0,
          sarTask: updatedTask,
        })
        .expect(200);

      expect(updatedIncident.sarTasks[0]).toMatchObject(updatedTask);
    });
  });

  describe("Error Handling", () => {
    it("should return 400 when body has incomplete fields", async () => {
      await request(app)
        .post("/api/incidents/new")
        .send({ incidentId: "ITest" })
        .expect(400);
    });

    it("should return 400 when the incidentId is not provided for update", async () => {
      await request(app)
        .put(`/api/incidents/update`)
        .send({ incidentState: "Assigned" })
        .expect(400);
    });

    it("should return 400 when the incidentId is not provided for chat group", async () => {
      await request(app)
        .put(`/api/incidents/ITest/chat-group`)
        .send({ channelId: new Types.ObjectId().toString() })
        .expect(400);
    });
  });
});
