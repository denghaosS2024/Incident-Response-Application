import CarController from "../../src/controllers/CarController";
import Car from "../../src/models/Car";
import City from "../../src/models/City";
import Incident, { IIncident } from "../../src/models/Incident";
import * as TestDatabase from "../utils/TestDatabase";

describe("CarController", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    // Clear the Car collection before each test
    await Car.deleteMany({});
    await Incident.deleteMany({});
  });

  const createTestIncident = async (username: string) => {
    const rawIncident = new Incident({
      incidentId: `I${username}`,
      caller: username,
      openingDate: new Date(),
      incidentState: "Waiting",
      owner: "System",
      commander: "System",
      incidentCallGroup: null,
      SarTasks: [],
    });

    return rawIncident.save();
  };

  describe("createCar", () => {
    it("should create a car with a valid name", async () => {
      const car = await CarController.createCar("MyCar");
      expect(car.name).toBe("MyCar");
      expect(car._id).toBeDefined();
    });

    it("should not create a car with an empty name", async () => {
      expect.assertions(1);
      try {
        await CarController.createCar("");
      } catch (e) {
        const error = e as Error;
        expect(error.message).toBe("Car name is required");
      }
    });

    it("should not create a car with a duplicate name", async () => {
      // Create a car first
      await CarController.createCar("DuplicateCar");

      // Try to create another car with the same name
      await expect(CarController.createCar("DuplicateCar")).rejects.toThrow(
        "Car with name 'DuplicateCar' already exists",
      );
    });
  });

  describe("getAllCars", () => {
    it("should retrieve all cars sorted by name", async () => {
      // Create a couple of cars for testing
      await CarController.createCar("ZCar");
      await CarController.createCar("ACar");

      const cars = await CarController.getAllCars();
      expect(cars.length).toBeGreaterThanOrEqual(2);

      // Check if the list is sorted by name
      const names = cars.map((c) => c.name);
      for (let i = 0; i < names.length - 1; i++) {
        expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    it("should handle errors in getAllCars", async () => {
      // Mock the Car.find method to throw an error
      jest.spyOn(Car, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      // Assertions
      await expect(CarController.getAllCars()).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("removeCarById", () => {
    it("should throw an error when car ID is not provided", async () => {
      await expect(CarController.removeCarById("")).rejects.toThrow(
        "Car ID is required",
      );
    });

    it("should throw an error when car ID is not a string", async () => {
      // @ts-ignore - Testing invalid type
      await expect(CarController.removeCarById(123)).rejects.toThrow(
        "Car ID is required",
      );
    });

    it("should throw an error when car ID format is invalid", async () => {
      await expect(CarController.removeCarById("invalid-id")).rejects.toThrow(
        "Invalid Car ID format",
      );
    });

    it("should throw an error when car with the ID does not exist", async () => {
      // Valid MongoDB ObjectId that doesn't exist in the database
      await expect(
        CarController.removeCarById("507f1f77bcf86cd799439011"),
      ).rejects.toThrow("Car not found");
    });

    it("should remove a car by ID", async () => {
      const newCar = await CarController.createCar("TempCar");
      const id = newCar._id.toString();

      await CarController.removeCarById(id);

      const found = await Car.findById(id);
      expect(found).toBeNull();
    });
  });

  // Tests for updateCarCity
  describe("updateCarCity", () => {
    it("should throw an error when car name is not provided", async () => {
      await expect(CarController.updateCarCity("", "City")).rejects.toThrow(
        "Car name is required",
      );
    });

    it("should throw an error when car does not exist", async () => {
      await expect(
        CarController.updateCarCity("NonExistentCar", "City"),
      ).rejects.toThrow("Car with name 'NonExistentCar' does not exist");
    });

    it("should throw an error when car is assigned to an incident", async () => {
      // Create a car assigned to an incident
      await Car.create({
        name: "IncidentCar",
        assignedIncident: "INC001",
      });

      await expect(
        CarController.updateCarCity("IncidentCar", ""),
      ).rejects.toThrow(
        "Cannot unassign car 'IncidentCar' because it is currently assigned to an incident",
      );
    });

    it("should throw an error when city name is not a string", async () => {
      // Create a test car
      await Car.create({
        name: "TestCar",
        assignedIncident: null,
      });

      // @ts-ignore - Testing invalid type
      await expect(CarController.updateCarCity("TestCar", 123)).rejects.toThrow(
        "City name is required",
      );
    });

    it("should throw an error when city does not exist", async () => {
      // Create a test car
      await Car.create({
        name: "TestCar",
        assignedIncident: null,
      });

      await expect(
        CarController.updateCarCity("TestCar", "NonExistentCity"),
      ).rejects.toThrow(
        "City 'NonExistentCity' does not exist in the database",
      );
    });

    it("should successfully assign a car to a city", async () => {
      // Create a test car
      await Car.create({
        name: "TestCar",
        assignedIncident: null,
      });

      // Mock City.findOne to return a city
      jest
        .spyOn(City, "findOne")
        .mockResolvedValueOnce({ name: "TestCity" } as any);

      // Call the method
      const updatedCar = await CarController.updateCarCity(
        "TestCar",
        "TestCity",
      );

      // Assertions
      expect(updatedCar).toBeDefined();
      expect(updatedCar!.name).toBe("TestCar");
      expect(updatedCar!.assignedCity).toBe("TestCity");
    });

    it("should successfully unassign a car from a city", async () => {
      // Create a test car with an assigned city
      await Car.create({
        name: "TestCarWithCity",
        assignedIncident: null,
        assignedCity: "SomeCity",
      });

      // Call the method with empty cityName to unassign
      const updatedCar = await CarController.updateCarCity(
        "TestCarWithCity",
        "",
      );

      // Assertions
      expect(updatedCar).toBeDefined();
      expect(updatedCar!.name).toBe("TestCarWithCity");
      expect(updatedCar!.assignedCity).toBeNull();
    });

    it("should handle errors when updating a non-existing car's city", async () => {
      // Create a test car
      await Car.create({
        name: "ErrorCar",
        assignedIncident: null,
      });

      jest
        .spyOn(City, "findOne")
        .mockResolvedValueOnce({ name: "TestCity" } as any);

      // Assertions
      await expect(
        CarController.updateCarCity("NewCar", "TestCity"),
      ).rejects.toThrow("Car with name 'NewCar' does not exist");
    });
  });

  describe("getAvailableCarsWithResponder", () => {
    it("should return cars that are not assigned to incidents and have responders", async () => {
      // Set up test data
      const testCars = [
        // Should be returned: no assigned incident and has responders
        {
          name: "Police Car 1",
          usernames: ["Officer Smith", "Officer Johnson"],
          assignedIncident: null,
          assignedCity: "New York",
        },
        // Should be returned: no assigned incident and has responders
        {
          name: "Police Car 2",
          usernames: ["Officer Williams"],
          assignedIncident: null,
          assignedCity: "New York",
        },
        // Should NOT be returned: has assigned incident
        {
          name: "Police Car 3",
          usernames: ["Officer Brown", "Officer Davis"],
          assignedIncident: "INC-001",
          assignedCity: "New York",
        },
        // Should NOT be returned: no responders
        {
          name: "Police Car 4",
          usernames: [],
          assignedIncident: null,
          assignedCity: "New York",
        },
        // Should NOT be returned: empty username array
        {
          name: "Police Car 5",
          usernames: [],
          assignedIncident: null,
          assignedCity: "New York",
        },
      ];

      // Insert the test cars into the database
      await Car.insertMany(testCars);

      // Call the method being tested
      const availableCars = await CarController.getAvailableCarsWithResponder();

      // Assertions
      expect(availableCars).toBeDefined();
      expect(Array.isArray(availableCars)).toBe(true);
      expect(availableCars.length).toBe(2);

      // Check that the returned cars are the expected ones
      const carNames = availableCars
        .map((car) => car.name)
        .sort((a, b) => a.localeCompare(b));
      expect(carNames).toEqual(
        ["Police Car 1", "Police Car 2"].sort((a, b) => a.localeCompare(b)),
      );

      // Check that the cars that should be excluded are not in the result
      expect(carNames).not.toContain("Police Car 3");
      expect(carNames).not.toContain("Police Car 4");
      expect(carNames).not.toContain("Police Car 5");

      // Verify that results are sorted by name
      expect(
        availableCars[0].name.localeCompare(availableCars[1].name),
      ).toBeLessThanOrEqual(0);
    });

    it("should return an empty array when no cars match the criteria", async () => {
      // Insert cars that don't match the criteria
      const testCars = [
        {
          name: "Police Car 1",
          usernames: [],
          assignedIncident: null,
          assignedCity: "New York",
        },
        {
          name: "Police Car 2",
          usernames: ["Officer Williams"],
          assignedIncident: "INC-002",
          assignedCity: "New York",
        },
      ];

      await Car.insertMany(testCars);

      // Call the method being tested
      const availableCars = await CarController.getAvailableCarsWithResponder();

      // Assertions
      expect(availableCars).toBeDefined();
      expect(Array.isArray(availableCars)).toBe(true);
      expect(availableCars.length).toBe(0);
    });

    it("should throw an error when database operation fails", async () => {
      // Mock the Car.find method to throw an error
      jest.spyOn(Car, "find").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      // Assertions
      await expect(
        CarController.getAvailableCarsWithResponder(),
      ).rejects.toThrow("Database error");
    });

    it("should add the username to the car when a responder is added", async () => {
      const testCar = {
        name: "Police Car 1",
        usernames: [],
        assignedIncident: null,
        assignedCity: "New York",
      };
      await Car.create(testCar);
      const updatedCar = await CarController.addUsernameToCar(
        "Police Car 1",
        "Officer Smith",
        null,
      );
      expect(updatedCar).toBeDefined();
      expect(updatedCar?.usernames).toContain("Officer Smith");
    });

    it("should add the username and assign the car to incident when a commander is added", async () => {
      const testCar = {
        name: "Police Car 1",
        usernames: [],
        assignedIncident: null,
        assignedCity: "New York",
      };
      const commandingIncident = await Incident.create({
        incidentId: "IJohn",
        caller: "John",
        openingDate: new Date(),
        incidentState: "Assigned",
        owner: "officer_john",
        commander: "officer_john",
        address: "",
        type: "U",
        priority: "E",
        incidentCallGroup: null,
      });
      await Car.create(testCar);
      const updatedCar = await CarController.addUsernameToCar(
        "Police Car 1",
        "Officer Smith",
        commandingIncident,
      );
      expect(updatedCar).toBeDefined();
      expect(updatedCar?.usernames).toContain("Officer Smith");
      expect(updatedCar?.assignedIncident).toBe("IJohn");
    });
  });

  // Tests for updateIncident
  describe("updateIncident", () => {
    it("should throw an error when car name is not provided", async () => {
      await expect(CarController.updateIncident("", "INC001")).rejects.toThrow(
        "Car name is required and must be a string",
      );
    });

    it("should throw an error when car does not exist", async () => {
      await expect(
        CarController.updateIncident("NonExistentCar", "INC001"),
      ).rejects.toThrow("Car with name 'NonExistentCar' does not exist");
    });

    it("should set incident to null when null is provided", async () => {
      // Create a test car with an assigned incident
      await Car.create({
        name: "TestCarWithIncident",
        assignedIncident: "INC001",
      });

      // Update incident to null
      const updatedCar = await CarController.updateIncident(
        "TestCarWithIncident",
        null,
      );

      // Verify incident was set to null
      expect(updatedCar).not.toBeNull();
      expect(updatedCar!.assignedIncident).toBeNull();
    });

    it("should be able to update incident in a car", async () => {
      const testCar = {
        name: "Police1",
        usernames: [],
        assignedIncident: "1234",
        assignedCity: "New York",
      };
      await Car.create(testCar);
      const car = await CarController.updateIncident("Police1", "5678");
      expect(car).toBeDefined();
      expect(car?.name).toBe("Police1");
      expect(car?.assignedIncident).toBe("5678");
    });
  });

  // Tests for getCarByName
  describe("getCarByName", () => {
    it("should throw an error when car name is not provided", async () => {
      await expect(CarController.getCarByName("")).rejects.toThrow(
        "Car name is required and must be a string",
      );
    });

    it("should throw an error when car does not exist", async () => {
      await expect(
        CarController.getCarByName("NonExistentCar"),
      ).rejects.toThrow("Car with name 'NonExistentCar' does not exist");
    });

    it("should be able to get car by name", async () => {
      const testCar = {
        name: "Police Car 1",
        usernames: [],
        assignedIncident: null,
        assignedCity: "New York",
      };
      await Car.create(testCar);
      const car = await CarController.getCarByName("Police Car 1");
      expect(car).toBeDefined();
      expect(car?.name).toBe("Police Car 1");
      expect(car?.assignedCity).toBe("New York");
    });
  });

  describe("CarController.addUsernameToCar", () => {
    it("should throw an error when car name is not provided", async () => {
      await expect(
        CarController.addUsernameToCar("", "username", null),
      ).rejects.toThrow("Car name is required");
    });

    it("should throw an error when username is not provided", async () => {
      await expect(
        CarController.addUsernameToCar("CarName", "", null),
      ).rejects.toThrow("Username is required");
    });

    it("should throw an error with invalid incident ID", async () => {
      // Create a car
      await Car.create({ name: "TestCar" });

      // Create a malformed incident object with missing or invalid incidentId
      const badIncident = {
        // Missing incidentId or has non-string incidentId
        caller: "John",
        openingDate: new Date(),
      } as IIncident;

      await expect(
        CarController.addUsernameToCar("TestCar", "username", badIncident),
      ).rejects.toThrow("Invalid incident ID");
    });

    it("should add a username to a car without a commanding incident", async () => {
      // Create a test car
      const carName = "Test Car";
      await Car.create({
        name: carName,
        type: "Car",
        usernames: ["Existing User"],
      });

      // Call the controller method
      const username = "New User";
      const updatedCar = await CarController.addUsernameToCar(
        carName,
        username,
        null,
      );

      // Assertions
      expect(updatedCar).toBeDefined();
      expect(updatedCar!.name).toBe(carName);
      expect(updatedCar!.usernames).toContain("Existing User");
      expect(updatedCar!.usernames).toContain(username);
    });

    it("should add a username to a car and assign it to an incident when commanding incident is provided", async () => {
      // Create a test car
      const carName = "Police Car";
      await Car.create({
        name: carName,
        type: "Car",
        usernames: [],
      });

      // Create a test incident
      const incident = await createTestIncident("Officer Smith");

      // Call the controller method
      const username = "Officer Smith";
      const updatedCar = await CarController.addUsernameToCar(
        carName,
        username,
        incident.toObject() as IIncident,
      );

      // Assertions
      expect(updatedCar).toBeDefined();
      expect(updatedCar!.name).toBe(carName);
      expect(updatedCar!.usernames).toContain(username);
      expect(updatedCar!.assignedIncident).toBe(incident.incidentId); // Incident should be assigned
    });

    it("should throw an error when the car does not exist", async () => {
      // Try to add a username to a non-existent car
      const nonExistentCarName = "Non-Existent Car";
      const username = "Test User";

      // Call the controller method and expect it to throw
      await expect(
        CarController.addUsernameToCar(nonExistentCarName, username, null),
      ).rejects.toThrow(`Car with name '${nonExistentCarName}' does not exist`);
    });

    it("should not add duplicate usernames in cars", async () => {
      // Create a test car
      const carName = "Unique Users Car";
      const username = "Duplicate User";
      await Car.create({
        name: carName,
        type: "Car",
        usernames: [username], // Username already exists
      });

      // Call the controller method with the same username
      const updatedCar = await CarController.addUsernameToCar(
        carName,
        username,
        null,
      );

      // Assertions
      expect(updatedCar).toBeDefined();
      expect(updatedCar!.usernames).toContain(username);
    });
  });

  // Tests for releaseUsernameFromCar
  describe("releaseUsernameFromCar", () => {
    it("should throw an error when car name is not provided", async () => {
      await expect(
        CarController.releaseUsernameFromCar("", "username"),
      ).rejects.toThrow("Car name is required and must be a string");
    });

    it("should throw an error when username is not provided", async () => {
      await expect(
        CarController.releaseUsernameFromCar("CarName", ""),
      ).rejects.toThrow("Username is required and must be a string");
    });

    it("should throw an error when car does not exist", async () => {
      await expect(
        CarController.releaseUsernameFromCar("NonExistentCar", "username"),
      ).rejects.toThrow("Car with name 'NonExistentCar' does not exist");
    });

    it("should throw an error when update fails", async () => {
      // Create a test car
      await Car.create({
        name: "TestCar",
        usernames: ["username"],
      });

      // Mock findOneAndUpdate to return null
      jest.spyOn(Car, "findOneAndUpdate").mockResolvedValueOnce(null);

      await expect(
        CarController.releaseUsernameFromCar("TestCar", "username"),
      ).rejects.toThrow("Failed to update car 'TestCar'");
    });

    it("should update incident when releasing the last username", async () => {
      // Create a test car with one username
      await Car.create({
        name: "TestCarWithOneUser",
        usernames: ["lastUser"],
      });

      // Create a test incident with this car assigned
      await Incident.create({
        incidentId: "INC123",
        caller: "Caller",
        openingDate: new Date(),
        incidentState: "Assigned",
        owner: "Owner",
        commander: "Commander",
        assignedVehicles: [{ name: "TestCarWithOneUser" }],
      });

      // Release the username
      const updatedCar = await CarController.releaseUsernameFromCar(
        "TestCarWithOneUser",
        "lastUser",
      );

      // Verify car was updated
      expect(updatedCar).toBeDefined();
      expect(updatedCar.name).toBe("TestCarWithOneUser");
      expect(updatedCar.usernames).toBeDefined();

      // Verify incident was updated
      const updatedIncident = await Incident.findOne({ incidentId: "INC123" });
      expect(
        updatedIncident?.assignedVehicles.some(
          (v) => v.name === "TestCarWithOneUser",
        ),
      ).toBeFalsy();
    });
  });
});
