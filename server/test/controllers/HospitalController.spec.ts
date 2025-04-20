import mongoose from "mongoose";
import Hospital from "../../src/models/Hospital";

import HospitalController from "../../src/controllers/HospitalController";
import * as TestDatabase from "../utils/TestDatabase";

describe("Hospital Controller", () => {
  beforeAll(async () => await TestDatabase.connect());

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });
  afterEach(async () => {
    await Hospital.deleteMany({});
    jest.restoreAllMocks();
  });

  afterAll(async () => await TestDatabase.close());

  const createTestHospital = async () => {
    const hospitalData = new Hospital({
      hospitalName: "Test Hospital",
      hospitalAddress: "123 Main St",
      hospitalDescription: "Test hospital",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
    });
    return await HospitalController.create(hospitalData);
  };

  it("should create hospital", async () => {
    const hospitalData = new Hospital({
      hospitalName: "Test Hospital",
      hospitalAddress: "123 Main St",
      hospitalDescription: "Test hospital",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
    });

    const newHospital = await HospitalController.create(hospitalData);

    expect(newHospital).toBeDefined();
    expect(newHospital.hospitalName?.toString()).toBe(
      hospitalData.hospitalName.toString(),
    );
    expect(newHospital.hospitalAddress.toString()).toBe(
      hospitalData.hospitalAddress.toString(),
    );
  });

  it("should return hospitals in alphabetical order", async () => {
    const hospitalData1 = new Hospital({
      hospitalId: "1234",
      hospitalName: "Zigzag Hospital",
      hospitalAddress: "123 Main St",
      hospitalDescription: "Test hospital",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
      nurses: [],
    });

    const hospitalData2 = new Hospital({
      hospitalId: "12",
      hospitalName: "Amazing Hospital",
      hospitalAddress: "123 Main St",
      hospitalDescription: "Test hospital",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
      nurses: [],
    });

    const hospital1 = await HospitalController.create(hospitalData1);
    const hospital2 = await HospitalController.create(hospitalData2);

    const hospitalList = await HospitalController.getAllHospitals();

    expect(hospital1).toBeDefined();
    expect(hospitalList[0].hospitalName.toString()).toBe(
      hospital2.hospitalName.toString(),
    );
    expect(hospitalList[1].hospitalName.toString()).toBe(
      hospital1.hospitalName.toString(),
    );
  });

  it("should not create an empty hospital", async () => {
    const hospitalData = new Hospital({});

    await expect(HospitalController.create(hospitalData)).rejects.toThrow(
      "Failed to create hospital",
    );

    const hospitalList = await HospitalController.getAllHospitals();
    expect(hospitalList).toHaveLength(0);
  });

  it("should return an empty array when no hospitals exist", async () => {
    const hospitalList = await HospitalController.getAllHospitals();
    expect(hospitalList).toEqual([]);
  });

  it("should throw an error when fetching hospitals fails", async () => {
    jest.spyOn(Hospital, "find").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    await expect(HospitalController.getAllHospitals()).rejects.toThrow(
      "Failed to fetch hospitals",
    );
  });

  it("should throw an error when updating hospitals fails", async () => {
    const hospitalData = new Hospital({
      hospitalName: "Test Hospital",
      hospitalAddress: "123 Main St",
      hospitalDescription: "Test hospital",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 5,
    });

    const hospital = await HospitalController.create(hospitalData);

    const updatedData = {
      hospitalId: hospital.hospitalId,
      totalNumberERBeds: 5,
    };

    jest.spyOn(Hospital, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    await expect(
      HospitalController.updateHospital(updatedData),
    ).rejects.toThrow("Database connection failed");

    expect(console.error).toHaveBeenCalledWith(
      "Error updating hospital:",
      expect.any(Error),
    );
  });

  it("should update hospital", async () => {
    const hospital = await createTestHospital();

    const updatedData = {
      hospitalId: hospital.hospitalId,
      hospitalName: "El Camino Hospital",
      hospitalAddress: "123 New Street",
    };

    const result = await HospitalController.updateHospital(updatedData);

    expect(result).toBeDefined();
    expect(result?.hospitalName?.toString()).toBe(
      updatedData.hospitalName.toString(),
    );
    expect(result?.hospitalAddress?.toString()).toBe(
      updatedData.hospitalAddress.toString(),
    );
  });

  it("should update multiple hospitals successfully", async () => {
    // Arrange
    const patient1 = new mongoose.Types.ObjectId();
    const patient2 = new mongoose.Types.ObjectId();
    const patient3 = new mongoose.Types.ObjectId();

    const hospital1 = await createTestHospital();
    const hospital2 = await createTestHospital();

    const hospitalId1 = hospital1.hospitalId;
    const hospitalId2 = hospital2.hospitalId;

    const updates = [
      {
        hospitalId: hospitalId1,
        patients: [patient1.toString(), patient2.toString()],
      },
      { hospitalId: hospitalId2, patients: [patient3.toString()] },
    ];

    // Act
    const result = await HospitalController.updateMultipleHospitals(updates);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0]?.hospitalId).toBe(hospitalId1);
    expect(result[0]?.patients.map((p) => p.toString())).toEqual([
      patient1.toString(),
      patient2.toString(),
    ]);
    expect(result[1]?.hospitalId).toBe(hospitalId2);
    expect(result[1]?.patients.map((p) => p.toString())).toEqual([
      patient3.toString(),
    ]);

    // Assert database state using getHospitalById
    const updatedHospital1 =
      await HospitalController.getHospitalById(hospitalId1);
    const updatedHospital2 =
      await HospitalController.getHospitalById(hospitalId2);

    expect(updatedHospital1).toBeDefined();
    expect(updatedHospital1?.patients.map((p) => p.toString())).toEqual([
      patient1.toString(),
      patient2.toString(),
    ]);

    expect(updatedHospital2).toBeDefined();
    expect(updatedHospital2?.patients.map((p) => p.toString())).toEqual([
      patient3.toString(),
    ]);
  });

  it("should throw an error if one or more hospitals do not exist", async () => {
    // Arrange

    const patient1 = new mongoose.Types.ObjectId();
    const patient2 = new mongoose.Types.ObjectId();
    const patient3 = new mongoose.Types.ObjectId();

    const hospital1 = await createTestHospital();
    const hospitalId1 = hospital1.hospitalId;
    const hospitalId2 = new mongoose.Types.ObjectId().toString(); // Non-existent hospital

    const updates = [
      {
        hospitalId: hospitalId1,
        patients: [patient1.toString(), patient2.toString()],
      },
      { hospitalId: hospitalId2, patients: [patient3.toString()] }, // Non-existent hospital
    ];

    // Act & Assert
    await expect(
      HospitalController.updateMultipleHospitals(updates),
    ).rejects.toThrow("One or more hospitals do not exist");

    // Assert database state remains unchanged
    const updatedHospital1 =
      await HospitalController.getHospitalById(hospitalId1);
    expect(updatedHospital1?.patients).toEqual([]);
  });

  it("should throw an error when hospitalId is missing", async () => {
    const updates: any = [{ patients: ["patient1", "patient2"] }]; // 'any' to bypass typescript type check

    await expect(
      HospitalController.updateMultipleHospitals(updates),
    ).rejects.toThrow("Invalid hospitalId in update data");
  });

  it("should throw an error when updating hospital with missing hospitalId", async () => {
    const updates: any = [{ patients: ["patient1", "patient2"] }];

    await expect(HospitalController.updateHospital(updates)).rejects.toThrow(
      "Invalid hospital data",
    );
  });

  it("should throw an error when the multiple hospital update fails due to a database issue", async () => {
    const patient1 = new mongoose.Types.ObjectId();
    const patient2 = new mongoose.Types.ObjectId();
    const patient3 = new mongoose.Types.ObjectId();

    const hospital1 = await createTestHospital();
    const hospital2 = await createTestHospital();

    const hospitalId1 = hospital1.hospitalId;
    const hospitalId2 = hospital2.hospitalId;

    const updates = [
      {
        hospitalId: hospitalId1,
        patients: [patient1.toString(), patient2.toString()],
      },
      { hospitalId: hospitalId2, patients: [patient3.toString()] },
    ];

    jest.spyOn(Hospital, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    await expect(
      HospitalController.updateMultipleHospitals(updates),
    ).rejects.toThrow("Failed to update multiple hospitals:");
  });

  it("should return an empty array if no updates are provided", async () => {
    // Arrange
    const updates: any[] = [];

    // Act
    const result = await HospitalController.updateMultipleHospitals(updates);

    // Assert
    expect(result).toEqual([]);

    // Assert database state remains unchanged
    const hospitals = await Hospital.find().exec();
    expect(hospitals).toHaveLength(0);
  });

  it("should delete hospital successfully", async () => {
    const hospital = await createTestHospital();
    const deletedHospital = await HospitalController.deleteHospital(
      hospital.hospitalId,
    );

    // Assert: Verify that the returned deleted hospital is defined and has the correct hospitalId
    expect(deletedHospital).toBeDefined();
    expect(deletedHospital?.hospitalId).toBe(hospital.hospitalId);

    // Verify that the hospital no longer exists in the database
    const foundHospital = await Hospital.findOne({
      hospitalId: hospital.hospitalId,
    });
    expect(foundHospital).toBeNull();
  });

  it("should return null when hospital does not exist", async () => {
    // Act: Call the deleteHospital method for a non-existent hospitalId
    const deletedHospital = await HospitalController.deleteHospital(
      "non_existent_hospital",
    );

    // Assert: Expect null to be returned since no hospital exists with that id
    expect(deletedHospital).toBeNull();
  });

  it("should throw an error if deletion fails", async () => {
    // Arrange: Simulate a database error by mocking findOneAndDelete to throw an error
    jest.spyOn(Hospital, "findOneAndDelete").mockImplementationOnce(() => {
      throw new Error("Database deletion error");
    });

    // Act & Assert: Expect the deleteHospital method to throw an error with the specific message
    await expect(
      HospitalController.deleteHospital("any_hospital"),
    ).rejects.toThrow("Failed to delete hospital");
  });
});
