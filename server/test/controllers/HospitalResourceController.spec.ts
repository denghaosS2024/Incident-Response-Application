import mongoose from "mongoose";
import HospitalResourceController from "../../src/controllers/HospitalResourceController";
import * as TestDatabase from "../utils/TestDatabase";

describe("HospitalResourceController", () => {
  beforeAll(async () => await TestDatabase.connect());

  beforeEach(async () => {
    await HospitalResourceController.deleteAllResources();
    await HospitalResourceController.deleteAllHospitalResources();
  });

  afterAll(async () => await TestDatabase.close());

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
    const resource1 = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    console.log("Created resource1:", resource1);

    const resource2 = await HospitalResourceController.createResource({
      resourceName: "Oxygen Tank",
    });

    console.log("Created resource2:", resource2);

    let newHospitalId1 = new mongoose.Types.ObjectId();
    let newHospitalId2 = new mongoose.Types.ObjectId();
    let newHospitalId3 = new mongoose.Types.ObjectId();

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
    expect(groupedResources).toBeDefined();
    expect(Object.keys(groupedResources)).toHaveLength(2);
    expect(groupedResources["Ventilator"]).toHaveLength(2);
    expect(groupedResources["Oxygen Tank"]).toHaveLength(1);

    expect(groupedResources["Ventilator"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          hospitalId: newHospitalId1.toString(),
          resourceName: "Ventilator",
          inStockQuantity: 10,
          inStockAlertThreshold: 5,
        }),
        expect.objectContaining({
          hospitalId: newHospitalId2.toString(),
          resourceName: "Ventilator",
          inStockQuantity: 20,
          inStockAlertThreshold: 8,
        }),
      ]),
    );

    expect(groupedResources["Oxygen Tank"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          hospitalId: newHospitalId3.toString(),
          resourceName: "Oxygen Tank",
          inStockQuantity: 15,
          inStockAlertThreshold: 3,
        }),
      ]),
    );
  });

  it("should return an empty object if no hospital resources exist", async () => {
    // Act
    const groupedResources =
      await HospitalResourceController.getAllHospitalResourcesGroupedByResource();

    // Assert
    expect(groupedResources).toEqual({});
  });
});
