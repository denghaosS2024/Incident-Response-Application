import mongoose from "mongoose";
import HospitalController from "../../src/controllers/HospitalController";
import HospitalResourceController from "../../src/controllers/HospitalResourceController";
import { IHospital } from "../../src/models/Hospital";
import * as TestDatabase from "../utils/TestDatabase";

describe("HospitalResourceController", () => {
  beforeAll(async () => await TestDatabase.connect());

  beforeEach(async () => {
    await HospitalResourceController.deleteAllResources();
    await HospitalResourceController.deleteAllHospitalResources();
  });

  afterAll(async () => await TestDatabase.close());

  const getDefaultHospitalData = (
    overrides: Partial<IHospital> = {},
  ): IHospital => {
    return {
      hospitalId: new mongoose.Types.ObjectId().toString(),
      hospitalName: "Default Hospital",
      hospitalAddress: `123 Default Street ${Date.now()}-${Math.random()}`,
      hospitalDescription: "Default Description",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 0,
      nurses: [],
      patients: [],
      hospitalGroupId: new mongoose.Types.ObjectId().toString(),
      ...overrides, // 覆盖默认值
    } as IHospital;
  };

  const createHospital = async (hospitalName: string) => {
    const hospitalData = getDefaultHospitalData({ hospitalName });
    const hospital = await HospitalController.create(hospitalData);
    return hospital;
  };

  it("should create a new resource", async () => {
    // Act
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });

    // Assert
    expect(resource).toBeDefined();
    expect(resource.resourceName).toBe("Ventilator");
    expect(resource._id).toBeDefined();
  });

  it("should not create a duplicate resource", async () => {
    // Arrange
    await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });

    // Act
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });

    // Assert
    expect(resource).toBeDefined();
    expect(resource.resourceName).toBe("Ventilator");
  });

  it("should create a new hospital resource", async () => {
    // Arrange
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });

    let newHospitalId = new mongoose.Types.ObjectId();
    // Act
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: newHospitalId,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    // Assert
    expect(hospitalResource).toBeDefined();
    expect(hospitalResource.hospitalId.toString()).toBe(
      newHospitalId.toString(),
    );
    expect(hospitalResource.inStockQuantity).toBe(10);
    expect(hospitalResource.inStockAlertThreshold).toBe(5);
  });

  it("should group hospital resources by resourceName", async () => {
    // Arrange
    const hospital1 = await createHospital("Test Hospital1");
    const hospital2 = await createHospital("Test Hospital2");
    const hospital3 = await createHospital("Test Hospital3");

    const resource1 = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    console.log("Created resource1:", resource1);

    const resource2 = await HospitalResourceController.createResource({
      resourceName: "Oxygen Tank",
    });

    console.log("Created resource2:", resource2);

    const newHospitalId1 = hospital1._id;
    const newHospitalId2 = hospital2._id;
    const newHospitalId3 = hospital3._id;

    const hospitalResource1 =
      await HospitalResourceController.createHospitalResource({
        hospitalId: newHospitalId1,
        resourceId: resource1._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    console.log("Created hospital resource for Hospital-1", hospitalResource1);

    const hospitalResource2 =
      await HospitalResourceController.createHospitalResource({
        hospitalId: newHospitalId2,
        resourceId: resource1._id,
        inStockQuantity: 20,
        inStockAlertThreshold: 8,
      });

    console.log("Created hospital resource for Hospital-2", hospitalResource2);

    const hospitalResource3 =
      await HospitalResourceController.createHospitalResource({
        hospitalId: newHospitalId3,
        resourceId: resource2._id,
        inStockQuantity: 15,
        inStockAlertThreshold: 3,
      });

    console.log("Created hospital resource for Hospital-3", hospitalResource3);

    // Act
    const groupedResources =
      await HospitalResourceController.getAllHospitalResourcesGroupedByResource();

    // Assert
    // Assert
    expect(groupedResources).toBeDefined();
    expect(Object.keys(groupedResources)).toHaveLength(2); // Two resource groups: "Ventilator" and "Oxygen Tank"

    // Check "Ventilator" group
    const ventilatorGroup = groupedResources["Ventilator"];
    expect(ventilatorGroup).toHaveLength(2);

    const ventilatorHospitalIds = ventilatorGroup.map((item) =>
      item.hospitalId._id.toString(),
    );
    const ventilatorResourceNames = ventilatorGroup.map(
      (item) => item.resourceId.resourceName,
    );
    const ventilatorQuantities = ventilatorGroup.map(
      (item) => item.inStockQuantity,
    );

    expect(ventilatorHospitalIds).toEqual(
      expect.arrayContaining([
        newHospitalId1.toString(),
        newHospitalId2.toString(),
      ]),
    );
    expect(ventilatorResourceNames).toEqual(
      expect.arrayContaining(["Ventilator", "Ventilator"]),
    );
    expect(ventilatorQuantities).toEqual(expect.arrayContaining([10, 20]));

    // Check "Oxygen Tank" group
    const oxygenTankGroup = groupedResources["Oxygen Tank"];
    expect(oxygenTankGroup).toHaveLength(1);

    const oxygenTankHospitalIds = oxygenTankGroup.map((item) =>
      item.hospitalId._id.toString(),
    );
    const oxygenTankResourceNames = oxygenTankGroup.map(
      (item) => item.resourceId.resourceName,
    );
    const oxygenTankQuantities = oxygenTankGroup.map(
      (item) => item.inStockQuantity,
    );

    expect(oxygenTankHospitalIds).toEqual(
      expect.arrayContaining([newHospitalId3.toString()]),
    );
    expect(oxygenTankResourceNames).toEqual(
      expect.arrayContaining(["Oxygen Tank"]),
    );
    expect(oxygenTankQuantities).toEqual(expect.arrayContaining([15]));
  });

  it("should return an empty object if no hospital resources exist", async () => {
    // Act
    const groupedResources =
      await HospitalResourceController.getAllHospitalResourcesGroupedByResource();

    // Assert
    expect(groupedResources).toEqual({});
  });
});
