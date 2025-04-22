import request from "supertest";
import app from "../../src/app";
import * as TestDatabase from "../utils/TestDatabase";
import HospitalResourceRequestController, {
  HospitalResourceRequestClient,
} from "../../src/controllers/HospitalResourceRequestController";
import { IHospital } from "../../src/models/Hospital";

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

  const createHospital = async (hospitalName: string) => {
    const response = await request(app)
      .post("/api/hospital/register")
      .send({
        hospitalName: hospitalName || "Test Hospital",
        hospitalAddress: "123 Main St",
        totalNumberERBeds: 100,
      });
    return response.body.hospitalId; // Return the generated hospitalId
  };

  const createHospitalResourceRequest = async (
    resourceRequest: HospitalResourceRequestClient,
  ) => {
    const response = await request(app)
      .post("/api/hospital-resources-requests")
      .send(resourceRequest)
      .expect(201);

    return response.body;
  };

  /* -------------------------------- POST: /api/hospital-resource ------------------------------------ */

  it("should create a new hospital resource request", async () => {
    const hospitalId = await createHospital("123");
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const resourceRequest: HospitalResourceRequestClient = {
      senderHospitalId: hospitalId,
      receiverHospitalId: hospitalId,
      hospitalResourceId: hospitalId,
      resourceName,
      requestedQuantity: 5,
      status: "Pending",
    };

    const response = await request(app)
      .post("/api/hospital-resources-requests")
      .send(resourceRequest)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.senderHospitalId).toBe(hospitalId);
    expect(response.body.receiverHospitalId).toBe(hospitalId);
    expect(response.body.requestedQuantity).toBe(5);
    expect(response.body.status).toBe("Pending");

    const gottenRequest =
      await HospitalResourceRequestController.getAllResourceRequests();

    expect(gottenRequest).toBeDefined();
    const sender = gottenRequest[0].senderHospitalId as unknown as IHospital;
    expect(sender.hospitalId).toBe(hospitalId);
    const receiver = gottenRequest[0].senderHospitalId as unknown as IHospital;
    expect(receiver.hospitalId).toBe(hospitalId);
    expect(gottenRequest[0].requestedQuantity).toBe(5);
    expect(gottenRequest[0].status).toBe("Pending");
  });

  it("should be able to get incoming requests", async () => {
    const hospitalId = await createHospital("123");
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const resourceRequest: HospitalResourceRequestClient = {
      senderHospitalId: hospitalId,
      receiverHospitalId: hospitalId,
      hospitalResourceId: hospitalId,
      resourceName,
      requestedQuantity: 5,
      status: "Pending",
    };

    await createHospitalResourceRequest(resourceRequest);

    const response = await request(app)
      .get(`/api/hospital-resources-requests/${hospitalId}/incoming`)
      .expect(200);

    expect(response.body).toBeDefined();
    const sender = response.body[0].senderHospitalId as unknown as IHospital;
    expect(sender._id).toBe(hospitalId);
    const receiver = response.body[0]
      .receiverHospitalId as unknown as IHospital;
    expect(receiver._id).toBe(hospitalId);
    expect(response.body[0].requestedQuantity).toBe(5);
    expect(response.body[0].status).toBe("Pending");
  });

  it("should be able to get outgoing requests", async () => {
    const hospitalId = await createHospital("123");
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const resourceRequest: HospitalResourceRequestClient = {
      senderHospitalId: hospitalId,
      receiverHospitalId: hospitalId,
      hospitalResourceId: hospitalId,
      resourceName,
      requestedQuantity: 5,
      status: "Pending",
    };

    await createHospitalResourceRequest(resourceRequest);

    const response = await request(app)
      .get(`/api/hospital-resources-requests/${hospitalId}/outgoing`)
      .expect(200);

    expect(response.body).toBeDefined();
    const sender = response.body[0].senderHospitalId as unknown as IHospital;
    expect(sender._id).toBe(hospitalId);
    const receiver = response.body[0]
      .receiverHospitalId as unknown as IHospital;
    expect(receiver._id).toBe(hospitalId);
    expect(response.body[0].requestedQuantity).toBe(5);
    expect(response.body[0].status).toBe("Pending");
  });

  it("should be able to get update the requested quantity", async () => {
    const hospitalId = await createHospital("123");
    const resourceName = "Ventilator";

    // Create a resource first
    await createResource(resourceName, hospitalId);

    const resourceRequest: HospitalResourceRequestClient = {
      senderHospitalId: hospitalId,
      receiverHospitalId: hospitalId,
      hospitalResourceId: hospitalId,
      resourceName,
      requestedQuantity: 5,
      status: "Pending",
    };

    await createHospitalResourceRequest(resourceRequest);

    const requester = await request(app)
      .get(`/api/hospital-resources-requests/${hospitalId}/incoming`)
      .expect(200);

    const response = await request(app)
      .put(
        `/api/hospital-resources-requests/${requester.body[0]._id}/requested-quantity`,
      )
      .send({ requestedQuantity: 6 })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.senderHospitalId).toBe(hospitalId);
    expect(response.body.receiverHospitalId).toBe(hospitalId);
    expect(response.body.requestedQuantity).toBe(6);
    expect(response.body.status).toBe("Pending");

    const gottenRequest =
      await HospitalResourceRequestController.getAllResourceRequests();

    expect(gottenRequest[3].requestedQuantity).toBe(6);
  });
});
