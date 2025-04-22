import mongoose from "mongoose";
import MissingPersonController from "../../src/controllers/MissingPersonController";
import MissingPerson, { Gender, Race } from "../../src/models/MissingPerson";
import * as TestDatabase from "../utils/TestDatabase";

describe("MissingPersonController", () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  });

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await MissingPerson.deleteMany({});
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  const createTestMissingPerson = async () => {
    const data: Partial<any> = {
      name: "Test Person",
      age: 40,
      weight: 80,
      height: 175,
      race: Race.White,
      eyeColor: "Blue",
      gender: Gender.Female,
      description: "Test description",
      dateLastSeen: new Date(),
      locationLastSeen: "Test Location",
      photo: "http://example.com/photo.jpg",
    };
    return MissingPersonController.create(data);
  };

  it("should create a missing person record", async () => {
    const payload = {
      name: "John Doe",
      age: 30,
      weight: 70,
      height: 180,
      race: Race.Asian,
      eyeColor: "Brown",
      gender: Gender.Male,
      description: "Missing since 2021",
      dateLastSeen: new Date("2021-01-01"),
      locationLastSeen: "Los Angeles",
      photo: "http://example.com/john.jpg",
    };
    const result = await MissingPersonController.create(payload);

    expect(result).toBeDefined();
    expect(result.name).toBe(payload.name);
    expect(result.age).toBe(payload.age);
    expect(result.race).toBe(Race.Asian);
    expect(result.gender).toBe(Gender.Male);
    expect(result.locationLastSeen).toBe(payload.locationLastSeen);
    // defaults
    expect(result.reportStatus).toBe("open");
    expect(result.personStatus).toBe("missing");
  });

  it("should throw if creation fails", async () => {
    jest.spyOn(MissingPerson.prototype, "save").mockImplementationOnce(() => {
      throw new Error("DB error");
    });

    await expect(
      MissingPersonController.create({
        name: "Jane Doe",
        age: 25,
        race: Race.Hispanic,
        gender: Gender.Female,
        dateLastSeen: new Date(),
      }),
    ).rejects.toThrow("Failed to create missing person record");

    expect(console.error).toHaveBeenCalledWith(
      "Error creating missing person:",
      expect.any(Error),
    );
  });

  it("should fetch a missing person by ID", async () => {
    const person = await createTestMissingPerson();
    const found = await MissingPersonController.getMissingPersonById(person.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(person.id);
  });

  it("should return null for non‑existent ID", async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    const found = await MissingPersonController.getMissingPersonById(randomId);

    expect(found).toBeNull();
  });

  it("should throw if fetch by ID errors out", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    jest.spyOn(MissingPerson, "findById").mockImplementationOnce(
      () =>
        ({
          exec: () => {
            throw new Error("DB fetch error");
          },
        }) as any,
    );

    await expect(
      MissingPersonController.getMissingPersonById(id),
    ).rejects.toThrow("Failed to fetch missing person record");

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching missing person by ID:",
      expect.any(Error),
    );
  });

  it("should return all records sorted by name", async () => {
    await MissingPersonController.create({
      name: "Zoe",
      age: 20,
      race: Race.White,
      gender: Gender.Female,
      dateLastSeen: new Date(),
    });
    await MissingPersonController.create({
      name: "Adam",
      age: 25,
      race: Race.White,
      gender: Gender.Male,
      dateLastSeen: new Date(),
    });

    const list = await MissingPersonController.getAllMissingPersons();
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe("Adam");
    expect(list[1].name).toBe("Zoe");
  });

  it("should return empty array when none exist", async () => {
    const list = await MissingPersonController.getAllMissingPersons();
    expect(list).toEqual([]);
  });

  it("should throw if fetch-all errors out", async () => {
    jest.spyOn(MissingPerson, "find").mockImplementationOnce(
      () =>
        ({
          sort: () => ({
            exec: () => {
              throw new Error("DB error");
            },
          }),
        }) as any,
    );

    await expect(
      MissingPersonController.getAllMissingPersons(),
    ).rejects.toThrow("Failed to fetch missing person records");

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching missing person records:",
      expect.any(Error),
    );
  });

  it("should update a missing person record", async () => {
    const person = await createTestMissingPerson();
    const update = { weight: 75, description: "Updated" };

    const updated = await MissingPersonController.updateMissingPerson(
      person.id,
      update,
    );
    expect(updated).toBeDefined();
    expect(updated?.weight).toBe(update.weight);
    expect(updated?.description).toBe(update.description);
  });

  it("should return null when updating non‑existent ID", async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    const updated = await MissingPersonController.updateMissingPerson(
      randomId,
      { weight: 60 },
    );
    expect(updated).toBeNull();
  });

  it("should throw if update errors out", async () => {
    const person = await createTestMissingPerson();
    jest.spyOn(MissingPerson, "findByIdAndUpdate").mockImplementationOnce(
      () =>
        ({
          exec: () => {
            throw new Error("DB update error");
          },
        }) as any,
    );

    await expect(
      MissingPersonController.updateMissingPerson(person.id, { age: 35 }),
    ).rejects.toThrow("Failed to update missing person record");

    expect(console.error).toHaveBeenCalledWith(
      "Error updating missing person:",
      expect.any(Error),
    );
  });

  it("should mark a missing person as found", async () => {
    const person = await createTestMissingPerson();
    const marked = await MissingPersonController.markAsFound(person.id);

    expect(marked).toBeDefined();
    expect(marked?.reportStatus).toBe("closed");
    // personStatus remains default "missing" unless your controller also sets it
    expect(marked?.personStatus).toBe("missing");

    const fromDb = await MissingPerson.findById(person.id).exec();
    expect(fromDb?.reportStatus).toBe("closed");
  });

  it("should return null when marking non‑existent ID", async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    const result = await MissingPersonController.markAsFound(randomId);
    expect(result).toBeNull();
  });

  it("should throw if markAsFound errors out", async () => {
    const person = await createTestMissingPerson();
    jest.spyOn(MissingPerson, "findByIdAndUpdate").mockImplementationOnce(
      () =>
        ({
          exec: () => {
            throw new Error("DB mark error");
          },
        }) as any,
    );

    await expect(
      MissingPersonController.markAsFound(person.id),
    ).rejects.toThrow("Failed to mark missing person as found");

    expect(console.error).toHaveBeenCalledWith(
      "Error marking missing person as found:",
      expect.any(Error),
    );
  });
});
