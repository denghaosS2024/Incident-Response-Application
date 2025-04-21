/**
 * CityController.spec.ts
 * Comprehensive tests for CityController (createCity, getAllCities, removeCityById, getCityAssignments, addCityAssignment)
 */

import CityController from "../../src/controllers/CityController";
import Car from "../../src/models/Car";
import City from "../../src/models/City";
import Truck from "../../src/models/Truck";
import Personnel from "../../src/models/User";
import * as TestDatabase from "../utils/TestDatabase";

describe("CityController", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    await City.deleteMany({});
    await Car.deleteMany({});
    await Truck.deleteMany({});
    await Personnel.deleteMany({});
  });

  describe("createCity", () => {
    it("should create a city with a valid name", async () => {
      const city = await CityController.createCity("ValidCity");
      expect(city.name).toBe("ValidCity");
      expect(city._id).toBeDefined();
    });

    it("should not create a city with an empty name", async () => {
      expect.assertions(1);
      try {
        await CityController.createCity("");
      } catch (e) {
        expect((e as Error).message).toBe("City name is required");
      }
    });

    it("should not create a city with an existing name", async () => {
      await CityController.createCity("DuplicateCity");

      expect.assertions(1);
      try {
        await CityController.createCity("DuplicateCity");
      } catch (e) {
        expect((e as Error).message).toBe(
          "City with name 'DuplicateCity' already exists",
        );
      }
    });
  });

  describe("getAllCities", () => {
    it("should retrieve all cities sorted by name", async () => {
      await CityController.createCity("ZCity");
      await CityController.createCity("ACity");

      const cities = await CityController.getAllCities();
      expect(cities.length).toBe(2);

      const names = cities.map((c) => c.name);
      expect(names).toEqual(["ACity", "ZCity"]);
    });

    it("should return an empty array if no cities exist", async () => {
      const cities = await CityController.getAllCities();
      expect(cities).toEqual([]);
    });
  });

  describe("removeCityById", () => {
    it("should remove a city by ID and return confirmation message", async () => {
      const newCity = await CityController.createCity("TempCity");
      const id = newCity._id.toString();

      const response = await CityController.removeCityById(id);
      expect(response).toEqual({
        message: `City with ID '${id}' and its assignments have been removed.`,
      });

      const found = await City.findById(id);
      expect(found).toBeNull();
    });

    it("should throw an error if city does not exist", async () => {
      expect.assertions(1);
      try {
        await CityController.removeCityById("605c72e1e3b3f21d8c98f9b3"); // Non-existent ID
      } catch (e) {
        expect((e as Error).message).toBe(
          "City with ID '605c72e1e3b3f21d8c98f9b3' not found",
        );
      }
    });
  });

  describe("getCityAssignments", () => {
    it("should return empty assignments for a city with no associated entities", async () => {
      await CityController.createCity("TestCity");

      const assignments = await CityController.getCityAssignments("TestCity");
      expect(assignments).toEqual({ cars: [], trucks: [], personnel: [] });
    });

    it("should throw an error if the city does not exist", async () => {
      expect.assertions(1);
      try {
        await CityController.getCityAssignments("NonExistentCity");
      } catch (e) {
        expect((e as Error).message).toBe(
          "City 'NonExistentCity' does not exist in the database",
        );
      }
    });
  });

  describe("addCityAssignment", () => {
    it("should add a car to a city", async () => {
      await CityController.createCity("CarCity");

      const car = new Car({ name: "TestCar", assignedCity: null });
      await car.save();

      const updatedCar = await CityController.addCityAssignment(
        "CarCity",
        "Car",
        "TestCar",
      );

      expect(updatedCar).not.toBeNull(); // Ensure it's not null before accessing properties
      expect(updatedCar!.assignedCity).toBe("CarCity");
    });

    it("should add a truck to a city", async () => {
      await CityController.createCity("TruckCity");

      const truck = new Truck({ name: "TestTruck", assignedCity: null });
      await truck.save();

      const updatedTruck = await CityController.addCityAssignment(
        "TruckCity",
        "Truck",
        "TestTruck",
      );

      expect(updatedTruck).not.toBeNull(); // Ensure it's not null before accessing properties
      expect(updatedTruck!.assignedCity).toBe("TruckCity");
    });

    describe("Unassignment branch", () => {
      it("should unassign a car from its current city when cityName is empty", async () => {
        await CityController.createCity("SomeCity");
        const car = new Car({
          name: "TestCarUnassign",
          assignedCity: "SomeCity",
        });
        await car.save();
        const updatedCar = await CityController.addCityAssignment(
          "",
          "Car",
          "TestCarUnassign",
        );
        expect(updatedCar).not.toBeNull();
        expect(updatedCar!.assignedCity).toBeNull();
      });

      it("should unassign a truck from its current city when cityName is empty", async () => {
        await CityController.createCity("SomeCity");
        const truck = new Truck({
          name: "TestTruckUnassign",
          assignedCity: "SomeCity",
        });
        await truck.save();
        const updatedTruck = await CityController.addCityAssignment(
          "",
          "Truck",
          "TestTruckUnassign",
        );
        expect(updatedTruck).not.toBeNull();
        expect(updatedTruck!.assignedCity).toBeNull();
      });

      it("should unassign a personnel from its current city when cityName is empty", async () => {
        await CityController.createCity("SomeCity");
        const personnel = new Personnel({
          username: "TestUserUnassign",
          password: "pass123",
          role: "Police",
          assignedCity: "SomeCity",
        });
        await personnel.save();
        const updatedUser = await CityController.addCityAssignment(
          "",
          "Personnel",
          "TestUserUnassign",
        );
        expect(updatedUser).not.toBeNull();
        expect(updatedUser!.assignedCity).toBeNull();
      });
    });
  });

  describe("CityFundingHistory", () => {
    it("should add police funding history successfully", async () => {
      await CityController.createCity("fundingCity");
      const personnel = new Personnel({
        username: "TestPoliceUser",
        password: "pass123",
        role: "Police Chief",
        assignedCity: "fundingCity",
      });
      const user = await personnel.save();
      const city = await CityController.addCityPoliceFundingHistory(
        "need money",
        "Request",
        user.id,
        5000,
        "fundingCity",
      );
      expect(city.policeFundingHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reason: "need money",
            type: "Request",
            amount: 5000,
          }),
        ]),
      );
    });

    it("should get police funding history successfully", async () => {
      await CityController.createCity("fundingCity");
      const personnel = new Personnel({
        username: "TestPoliceUser",
        password: "pass123",
        role: "Police Chief",
        assignedCity: "fundingCity",
      });
      const user = await personnel.save();
      await CityController.addCityPoliceFundingHistory(
        "need money",
        "Request",
        user.id,
        5000,
        "fundingCity",
      );
      const history =
        await CityController.getCityPoliceFundingHistory("fundingCity");
      expect(history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reason: "need money",
            type: "Request",
            amount: 5000,
          }),
        ]),
      );
    });

    it("should add fire funding history successfully", async () => {
      await CityController.createCity("fundingCity");
      const personnel = new Personnel({
        username: "TestFireUser",
        password: "pass123",
        role: "Fire Chief",
        assignedCity: "fundingCity",
      });
      const user = await personnel.save();
      const city = await CityController.addCityFireFundingHistory(
        "need money",
        "Request",
        user.id,
        5000,
        "fundingCity",
      );
      expect(city.fireFundingHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reason: "need money",
            type: "Request",
            amount: 5000,
          }),
        ]),
      );
    });

    it("should get fire funding history successfully", async () => {
      await CityController.createCity("fundingCity");
      const personnel = new Personnel({
        username: "TestFireUser",
        password: "pass123",
        role: "Fire Chief",
        assignedCity: "fundingCity",
      });
      const user = await personnel.save();
      await CityController.addCityFireFundingHistory(
        "need money",
        "Request",
        user.id,
        5000,
        "fundingCity",
      );
      const history =
        await CityController.getCityFireFundingHistory("fundingCity");
      expect(history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            reason: "need money",
            type: "Request",
            amount: 5000,
          }),
        ]),
      );
    });
  });

  describe("FundingRemaining", () => {
    it("should update remaining funding successfully", async () => {
      await CityController.createCity("fundingCity");
      const city = await CityController.updateCityRemainingFunding(
        "fundingCity",
        1000,
      );
      expect(city.remainingFunding).toEqual(1000);
    });
  });
});
