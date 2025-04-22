import mongoose from "mongoose";
import request from "supertest";
import MissingPersonController from "../../src/controllers/MissingPersonController";
import MissingPerson, { Gender, Race } from "../../src/models/MissingPerson";
import * as TestDatabase from "../utils/TestDatabase";

jest.mock("../../src/utils/UserConnections", () => ({
  broadcast: jest.fn(),
}));

import app from "../../src/app";
import UserConnections from "../../src/utils/UserConnections";

describe("Router - MissingPerson", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await MissingPerson.deleteMany({});
  });

  describe("POST /api/missingPerson/register", () => {
    const validPayload = {
      name: "Alice",
      age: 25,
      race: Race.Asian,
      gender: Gender.Female,
      dateLastSeen: "2025-04-01T00:00:00.000Z",
      description: "Last seen near downtown",
      locationLastSeen: "Downtown",
      photo: "http://example.com/photo.jpg",
    };

    it("should register a new missing person and broadcast without photo", async () => {
      const res = await request(app)
        .post("/api/missingPerson/register")
        .send(validPayload)
        .expect(201);

      // Response body has all fields including photo
      expect(res.body.name).toBe(validPayload.name);
      expect(res.body.age).toBe(validPayload.age);
      expect(res.body.race).toBe(validPayload.race);
      expect(res.body.gender).toBe(validPayload.gender);

      // Broadcast called with payload minus photo
      expect(UserConnections.broadcast).toHaveBeenCalledTimes(1);
      const [event, broadcastPayload] = (UserConnections.broadcast as jest.Mock)
        .mock.calls[0];
      expect(event).toBe("missingPerson");
      expect(broadcastPayload).toMatchObject({
        name: validPayload.name,
        age: validPayload.age,
        race: validPayload.race,
        gender: validPayload.gender,
        description: validPayload.description,
        locationLastSeen: validPayload.locationLastSeen,
      });
      expect((broadcastPayload as any).photo).toBeUndefined();
    });

    it("should return 400 if mandatory fields are missing", async () => {
      const res = await request(app)
        .post("/api/missingPerson/register")
        .send({ name: "Bob" })
        .expect(400);

      expect(res.body).toEqual({
        message:
          "name, age, race, gender, and dateLastSeen are mandatory fields.",
      });
      expect(UserConnections.broadcast).not.toHaveBeenCalled();
    });

    it("should return 500 if controller.create throws", async () => {
      jest
        .spyOn(MissingPersonController, "create")
        .mockRejectedValueOnce(new Error("Controller failure"));

      const res = await request(app)
        .post("/api/missingPerson/register")
        .send({
          name: "Charlie",
          age: 30,
          race: Race.White,
          gender: Gender.Male,
          dateLastSeen: "2025-04-01T00:00:00.000Z",
        })
        .expect(500);

      expect(res.body).toEqual({ message: "Controller failure" });
      expect(UserConnections.broadcast).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/missingPerson/report", () => {
    const createPerson = (overrides = {}) =>
      request(app)
        .post("/api/missingPerson/register")
        .send({
          name: "Test",
          age: 50,
          race: Race.White,
          gender: Gender.Male,
          dateLastSeen: "2025-04-01T00:00:00.000Z",
          ...overrides,
        })
        .expect(201);

    it("should return all missing persons when no id query", async () => {
      await createPerson({ name: "Zoe" });
      await createPerson({ name: "Adam" });

      const res = await request(app)
        .get("/api/missingPerson/report")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      // Ensure both records are present
      const names = res.body.map((p: any) => p.name).sort();
      expect(names).toEqual(["Adam", "Zoe"]);
    });

    it("should return a single record when id is provided", async () => {
      const createRes = await createPerson({ name: "Unique" });
      const id = createRes.body._id;

      const res = await request(app)
        .get("/api/missingPerson/report")
        .query({ id })
        .expect(200);

      expect(res.body).toHaveProperty("_id", id);
      expect(res.body.name).toBe("Unique");
    });

    it("should return 404 when record not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get("/api/missingPerson/report")
        .query({ id: fakeId })
        .expect(404);

      expect(res.body).toEqual({
        message: "Missing person report not found.",
      });
    });

    it("should return 500 if controller.getMissingPersonById throws", async () => {
      const spy = jest
        .spyOn(MissingPersonController, "getMissingPersonById")
        .mockRejectedValueOnce(new Error("Lookup failure"));

      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get("/api/missingPerson/report")
        .query({ id: fakeId })
        .expect(500);

      expect(res.body).toEqual({ message: "Lookup failure" });
      spy.mockRestore();
    });

    it("should return 500 if controller.getAllMissingPersons throws", async () => {
      const spy = jest
        .spyOn(MissingPersonController, "getAllMissingPersons")
        .mockRejectedValueOnce(new Error("List failure"));

      const res = await request(app)
        .get("/api/missingPerson/report")
        .expect(500);

      expect(res.body).toEqual({ message: "List failure" });
      spy.mockRestore();
    });
  });
});
