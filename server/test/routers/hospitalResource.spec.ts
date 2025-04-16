import mongoose from "mongoose";
import request from "supertest";

import app from "../../src/app";
import HospitalResourceController from "../../src/controllers/HospitalResourceController";
import * as TestDatabase from "../utils/TestDatabase";

describe("Router - HospitalResource", () => {
  beforeAll(TestDatabase.connect);
  afterAll(TestDatabase.close);

  const createResource = async (resourceName: string, hospitalId: string) => {
    const response = await request(app)
      .post("/api/hospital-resource")
      .send({
        hospitalId: hospitalId,
        resourceName,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      })
      .expect(201);
    return response.body;
  };

  /* -------------------------------- POST: /api/hospital-resource ------------------------------------ */

  it("should create a new hospital resource", async () => {
    const hospitalId = new mongoose.Types.ObjectId().toString();
    const resourceName = "Ventilator";

    const response = await request(app)
      .post("/api/hospital-resource")
      .send({
        hospitalId,
        resourceName,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.hospitalId).toBe(hospitalId);
    expect(response.body.resourceName).toBe(resourceName);
    expect(response.body.inStockQuantity).toBe(10);
    expect(response.body.inStockAlertThreshold).toBe(5);
  });

  it("should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .post("/api/hospital-resource")
      .send({
        resourceName: "Ventilator",
        inStockQuantity: 10,
      })
      .expect(400);

    expect(response.body.message).toBe(
      "hospitalId, resourceName, and inStockQuantity are mandatory fields.",
    );
  });

  /* -------------------------------- PUT: /api/hospital-resource ------------------------------------ */

  it("should update an existing hospital resource", async () => {
    const hospitalId = new mongoose.Types.ObjectId().toString();
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const response = await request(app)
      .put("/api/hospital-resource")
      .send({
        hospitalId,
        resourceName,
        inStockQuantity: 20,
        inStockAlertThreshold: 10,
      })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.hospitalId).toBe(hospitalId);
    expect(response.body.resourceName).toBe(resourceName);
    expect(response.body.inStockQuantity).toBe(20);
    expect(response.body.inStockAlertThreshold).toBe(10);
  });

  it("should return 404 if the hospital resource does not exist", async () => {
    const response = await request(app)
      .put("/api/hospital-resource")
      .send({
        hospitalId: new mongoose.Types.ObjectId().toString(),
        resourceName: "Ventilator",
        inStockQuantity: 20,
        inStockAlertThreshold: 10,
      })
      .expect(404);

    expect(response.body.message).toBe("HospitalResource not found.");
  });

  /* -------------------------------- GET: /api/hospital-resource/{resourceName} ------------------------------------ */

  it("should fetch all hospitals with a specific resource", async () => {
    const hospitalId = new mongoose.Types.ObjectId().toString();
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const response = await request(app)
      .get(`/api/hospital-resource/${resourceName}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].resourceName).toBe(resourceName);
  });

  it("should return 404 if no hospitals are found for the resource", async () => {
    await request(app)
      .get("/api/hospital-resource/NonExistentResource")
      .expect(404);
  });

  /* -------------------------------- GET: /api/hospital-resource ------------------------------------ */

  it("should fetch all hospital resources grouped by resourceName", async () => {
    const resourceName1 = "Ventilator";
    const resourceName2 = "Oxygen Tank";
    const hospitalId = new mongoose.Types.ObjectId().toString();

    // Create resources
    await createResource(resourceName1, hospitalId);
    await createResource(resourceName2, hospitalId);

    const response = await request(app)
      .get("/api/hospital-resource")
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Object.keys(response.body)).toContain(resourceName1);
    expect(Object.keys(response.body)).toContain(resourceName2);
    expect(Array.isArray(response.body[resourceName1])).toBe(true);
    expect(Array.isArray(response.body[resourceName2])).toBe(true);
  });

  /* -------------------------------- Error Handling ------------------------------------ */

  it("should return 500 if an unexpected error occurs", async () => {
    jest
      .spyOn(
        HospitalResourceController,
        "getAllHospitalResourcesGroupedByResource",
      )
      .mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

    const response = await request(app)
      .get("/api/hospital-resource")
      .expect(500);

    expect(response.body.message).toBe("Unexpected error");
  });
});
