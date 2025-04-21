import request from "supertest";
import app from "../../src/app";
import Car from "../../src/models/Car";
import City from "../../src/models/City";
import Truck from "../../src/models/Truck";
import Personnel from "../../src/models/User";
import * as TestDatabase from "../utils/TestDatabase";

describe("City Routes", () => {
  beforeAll(async () => {
    await TestDatabase.connect();

    await Promise.all([
      City.deleteMany({}),
      Car.deleteMany({}),
      Truck.deleteMany({}),
      Personnel.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    // Clean up test data

    await Promise.all([
      City.deleteMany({}),
      Car.deleteMany({}),
      Truck.deleteMany({}),
      Personnel.deleteMany({}),
    ]);

    await TestDatabase.close();
  });

  describe("POST /api/cities", () => {
    it("should create a new city", async () => {
      const response = await request(app)
        .post("/api/cities") // Make sure your app uses: app.use('/api/city', cityRouter)
        .send({ name: "Test City" })
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe("Test City");
    });

    it("should return 400 if city name is missing", async () => {
      const response = await request(app)
        .post("/api/cities")
        .send({ name: "" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/City name is required/i);
    });

    it("should return 400 if city already exists", async () => {
      // "Test City" was created above
      const response = await request(app)
        .post("/api/cities")
        .send({ name: "Test City" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/already exists/i);
    });
  });

  describe("GET /api/cities", () => {
    it("should get all cities", async () => {
      // We already have "Test City" in the DB
      const response = await request(app).get("/api/cities").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Check that at least one city ("Test City") is returned
      expect(
        response.body.some(
          (c: Record<string, unknown>) => c.name === "Test City",
        ),
      ).toBe(true);
    });
  });

  describe("DELETE /api/cities/:cityId", () => {
    let cityIdToDelete: string;

    beforeAll(async () => {
      // Create a city to be removed
      const city = await City.create({ name: "Removable City" });
      cityIdToDelete = city._id.toString();

      // Create references to "Removable City" in Car/Truck/Personnel
      await Car.create({
        name: "CityCar1",
        assignedCity: "Removable City",
      });
      await Truck.create({
        name: "CityTruck1",
        assignedCity: "Removable City",
      });
      await Personnel.create({
        username: "CityUser1",
        password: "password",
        role: "Police", // Must be Police or Fire to allow assignedCity
        assignedCity: "Removable City",
      });
    });

    it("should delete a city by id and reset related assignments", async () => {
      // Verify references exist before deletion

      const [carsBefore, trucksBefore, personnelBefore] = await Promise.all([
        Car.find({
          assignedCity: "Removable City",
        }),
        Truck.find({
          assignedCity: "Removable City",
        }),
        Personnel.find({
          assignedCity: "Removable City",
        }),
      ]);

      expect(carsBefore.length).toBeGreaterThan(0);
      expect(trucksBefore.length).toBeGreaterThan(0);
      expect(personnelBefore.length).toBeGreaterThan(0);

      // Delete the city
      const response = await request(app)
        .delete(`/api/cities/${cityIdToDelete}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/City deleted/i);

      const [deletedCity, carsAfter, trucksAfter, personnelAfter] =
        await Promise.all([
          City.findById(cityIdToDelete),
          Car.find({ assignedCity: "Removable City" }),
          Truck.find({ assignedCity: "Removable City" }),
          Personnel.find({ assignedCity: "Removable City" }),
        ]);

      // City should be gone
      expect(deletedCity).toBeNull();

      // All references to the city should be reset
      expect(carsAfter.length).toBe(0);
      expect(trucksAfter.length).toBe(0);
      expect(personnelAfter.length).toBe(0);
    });

    it("should return 400 if city does not exist", async () => {
      const response = await request(app)
        .delete("/api/cities/605c3c81e403fc1c7c4d26e1") // some random ID
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/not found/i);
    });
  });

  describe("GET /api/cities/assignments/:cityName", () => {
    const cityName = "Assignment City";

    beforeAll(async () => {
      // Create a city
      await City.create({ name: cityName });

      await Promise.all([
        // Create some Car/Truck/Personnel referencing that city
        Car.create({ name: "CarA", assignedCity: cityName }),
        Truck.create({ name: "TruckA", assignedCity: cityName }),
        Personnel.create({
          username: "UserA",
          password: "test123",
          role: "Police", // Must match validation requirement
          assignedCity: cityName,
        }),
      ]);
    });

    it("should get the assignments for a city", async () => {
      const response = await request(app)
        .get(`/api/cities/assignments/${cityName}`)
        .expect(200);

      expect(response.body).toHaveProperty("cars");
      expect(response.body).toHaveProperty("trucks");
      expect(response.body).toHaveProperty("personnel");

      expect(response.body.cars.length).toBeGreaterThan(0);
      expect(response.body.trucks.length).toBeGreaterThan(0);
      expect(response.body.personnel.length).toBeGreaterThan(0);
    });

    it("should return 400 if city does not exist", async () => {
      const response = await request(app)
        .get("/api/cities/assignments/UnknownCity")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/does not exist/i);
    });
  });

  describe("PUT /api/cities/assignments/:cityName", () => {
    const cityName = "Update City";

    beforeAll(async () => {
      // Create a city
      await City.create({ name: cityName });

      // Create a Car, Truck, and Personnel with no assignedCity
      await Car.create({ name: "CarNoCity" });
      await Truck.create({ name: "TruckNoCity" });
      // We give the user a valid role so assignedCity is allowed
      await Personnel.create({
        username: "UserNoCity",
        password: "pass123",
        role: "Police",
      });
    });

    it("should assign a Car to a city", async () => {
      const response = await request(app)
        .put(`/api/cities/assignments/${cityName}`)
        .send({ type: "Car", name: "CarNoCity" })
        .expect(200);

      expect(response.body).toHaveProperty("assignedCity", cityName);

      // Verify in the DB
      const updatedCar = await Car.findOne({ name: "CarNoCity" });
      expect(updatedCar?.assignedCity).toBe(cityName);
    });

    it("should assign a Truck to a city", async () => {
      const response = await request(app)
        .put(`/api/cities/assignments/${cityName}`)
        .send({ type: "Truck", name: "TruckNoCity" })
        .expect(200);

      expect(response.body).toHaveProperty("assignedCity", cityName);

      // Verify in the DB
      const updatedTruck = await Truck.findOne({ name: "TruckNoCity" });
      expect(updatedTruck?.assignedCity).toBe(cityName);
    });

    it("should assign a Personnel to a city", async () => {
      const response = await request(app)
        .put(`/api/cities/assignments/${cityName}`)
        .send({ type: "Personnel", name: "UserNoCity" })
        .expect(200);

      expect(response.body).toHaveProperty("assignedCity", cityName);

      // Verify in the DB
      const updatedUser = await Personnel.findOne({
        username: "UserNoCity",
      });
      expect(updatedUser?.assignedCity).toBe(cityName);
    });

    it("should return 400 if city does not exist", async () => {
      const response = await request(app)
        .put("/api/cities/assignments/NonExistentCity")
        .send({ type: "Car", name: "SomeCar" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/does not exist/i);
    });

    it("should return 400 if type is invalid", async () => {
      const response = await request(app)
        .put(`/api/cities/assignments/${cityName}`)
        .send({ type: "InvalidType", name: "Whatever" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/Invalid type/i);
    });
  });

  describe("DELETE /api/cities/assignments/:type/:name", () => {
    beforeAll(async () => {
      await City.create({ name: "AssignmentCity" });
      await Truck.create({
        name: "TruckToUnassign",
        assignedCity: "AssignmentCity",
      });
    });

    afterAll(async () => {
      await City.deleteMany({ name: "AssignmentCity" });
      await Truck.deleteMany({ name: "TruckToUnassign" });
    });

    it("should unassign a Truck from its city (cancel assignment)", async () => {
      const response = await request(app)
        .delete("/api/cities/assignments/Truck/TruckToUnassign")
        .expect(200);

      expect(response.body).toHaveProperty("assignedCity", null);

      const updatedTruck = await Truck.findOne({
        name: "TruckToUnassign",
      });
      expect(updatedTruck?.assignedCity).toBeNull();
    });

    it("should return 400 for invalid type", async () => {
      const response = await request(app)
        .delete("/api/cities/assignments/InvalidType/TruckToUnassign")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(/Invalid type/i);
    });
  });

  describe("POST /api/cities/funding-history/:cityName/:role", () => {
    beforeAll(async () => {
      await City.create({ name: "fundingCity" });
    });

    afterAll(async () => {
      await City.deleteMany({ name: "fundingCity" });
      await Personnel.deleteMany({ name: "firechief1" });
    });

    it("should post a history record successfully", async () => {
      const sender = new Personnel({
        username: "firechief1",
        password: "test123",
        role: "Fire Chief",
        assignedCity: "fundingCity",
      });
      await sender.save();
      const res = await request(app)
        .post("/api/cities/funding-history/fundingCity/Fire Chief")
        .set("x-application-uid", sender._id.toString())
        .send({
          type: "Request",
          amount: 4000,
          reason: "need new hose",
        })
        .expect(201);

      expect(res.body).toHaveProperty("fireFundingHistory");
      expect(res.body.fireFundingHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "Request",
            reason: "need new hose",
            amount: 4000,
          }),
        ]),
      );
    });

    it("should return 400 if city does not exist", async () => {
      const sender = new Personnel({
        username: "firechief2",
        password: "test123",
        role: "Fire Chief",
        assignedCity: "fundingCity",
      });
      await sender.save();
      await request(app)
        .post("/api/cities/funding-history/noCity/Fire Chief")
        .set("x-application-uid", sender._id.toString())
        .send({
          type: "Request",
          amount: 4000,
          reason: "need new hose",
        })
        .expect(400);
    });
  });

  describe("GET /api/cities/funding-history/:cityName/:role", () => {
    beforeAll(async () => {
      await City.create({ name: "fundingCity" });
    });

    afterAll(async () => {
      await City.deleteMany({ name: "fundingCity" });
      await Personnel.deleteMany({ name: "firechief3" });
    });

    it("should get a history record successfully", async () => {
      const sender = new Personnel({
        username: "firechief3",
        password: "test123",
        role: "Fire Chief",
        assignedCity: "fundingCity",
      });
      await sender.save();

      await City.updateOne(
        { name: "fundingCity" },
        {
          $inc: { fireFunding: 4000 },
          $push: {
            fireFundingHistory: {
              type: "Request",
              amount: 4000,
              reason: "need new house",
              timestamp: new Date(),
              sender: sender._id,
            },
          },
        },
      );

      const res = await request(app)
        .get("/api/cities/funding-history/fundingCity/Fire Chief")
        .expect(200);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "Request",
            reason: "need new house",
            amount: 4000,
          }),
        ]),
      );
    });
  });

  describe("POST /api/cities/remaining-funding/:cityName", () => {
    beforeAll(async () => {
      await City.create({ name: "fundingCity" });
    });

    afterAll(async () => {
      await City.deleteMany({ name: "fundingCity" });
    });

    it("should update remaining funding successfully", async () => {
      const res = await request(app)
        .post("/api/cities/remaining-funding/fundingCity")
        .send({
          amount: 4000,
        })
        .expect(200);

      expect(res.body.remainingFunding).toEqual(4000);
    });

    it("should return 400 if city not existed", async () => {
      await request(app)
        .post("/api/cities/remaining-funding/mofundingCity")
        .send({
          amount: 4000,
        })
        .expect(400);
    });
  });
});
