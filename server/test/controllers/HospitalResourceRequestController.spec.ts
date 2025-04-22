import { Types } from "mongoose";
import HospitalResourceController from "../../src/controllers/HospitalResourceController";
import HospitalResourceRequestController from "../../src/controllers/HospitalResourceRequestController";
import * as TestDatabase from "../utils/TestDatabase";
import { IResourceRequestBase } from "../../src/models/HospitalResourceRequest";
import HospitalController from "../../src/controllers/HospitalController";
import { IHospital } from "../../src/models/Hospital";

describe("HospitalResourceController", () => {
  beforeAll(async () => await TestDatabase.connect());

  beforeEach(async () => {
    await HospitalResourceController.deleteAllResources();
    await HospitalResourceController.deleteAllHospitalResources();
  });

  afterAll(async () => await TestDatabase.close());
  
  const createHospital = () => {
    return {
      hospitalId: new Types.ObjectId().toString(),
      hospitalName: "Default Hospital",
      hospitalAddress: `123 Default Street ${Date.now()}-${Math.random()}`,
      hospitalDescription: "Default Description",
      totalNumberERBeds: 10,
      totalNumberOfPatients: 0,
      nurses: [],
      patients: [],
      hospitalGroupId: new Types.ObjectId().toString(),
    } as unknown as IHospital;
  }

  it("should create a new resource request", async () => {
    // Act
    const mockRequest: IResourceRequestBase = {
      senderHospitalId: new Types.ObjectId(),
      receiverHospitalId: new Types.ObjectId(),
      hospitalResourceId: new Types.ObjectId(),
      resourceId: new Types.ObjectId(),
      requestedQuantity: 5,
      status: "Pending",
    };

    const resourceRequest =
      await HospitalResourceRequestController.createResourceRequest(
        mockRequest,
      );

    // Assert
    expect(resourceRequest).toBeDefined();
    expect(resourceRequest.status).toBe("Pending");
    expect(resourceRequest._id).toBeDefined();
  });

  it("should get all the resource requests", async () => {
    const hospitalData = createHospital()

    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);

    const requests =
      await HospitalResourceRequestController.getAllResourceRequests();

    expect(requests).toHaveLength(2);
    expect(requests[1].senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[1].receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[1].hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(requests[1].resourceId._id.toString()).toBe(resource._id.toString());
    expect(requests[1].requestedQuantity).toBe(5);
    expect(requests[1].status).toBe("Pending");
  });

  it("should get all the resource requests", async () => {
    const hospitalData = createHospital();

    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    const createdRequest = await HospitalResourceRequestController.createResourceRequest(mockRequest);

    const gottenRequest =
      await HospitalResourceRequestController.getResourceRequestById(
        createdRequest._id,
      );

    expect(gottenRequest).toBeDefined();
    expect(gottenRequest.senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(gottenRequest.receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(gottenRequest.hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(gottenRequest.resourceId._id.toString()).toBe(
      resource._id.toString(),
    );
    expect(gottenRequest.requestedQuantity).toBe(5);
    expect(gottenRequest.status).toBe("Pending");
  });

  it("should fetch resource requests by sender hospital ID", async () => {

    const hospitalData = createHospital();

    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);

    const requests =
      await HospitalResourceRequestController.getResourceRequestsBySenderHospital(
        hospital._id,
      );

    expect(requests).toHaveLength(1);
    expect(requests[0].senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[0].receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[0].hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(requests[0].resourceId._id.toString()).toBe(resource._id.toString());
    expect(requests[0].requestedQuantity).toBe(5);
    expect(requests[0].status).toBe("Pending");
  });

  it("should fetch resource requests by receiver hospital ID", async () => {
   const hospitalData = createHospital();
    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);

    const requests =
      await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
        hospital._id,
      );

    expect(requests).toHaveLength(1);
    expect(requests[0].senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[0].receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(requests[0].hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(requests[0].resourceId._id.toString()).toBe(resource._id.toString());
    expect(requests[0].requestedQuantity).toBe(5);
    expect(requests[0].status).toBe("Pending");
  });

  it("should update request status", async () => {
   const hospitalData = createHospital();

    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);
    const requests =
      await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
        hospital._id,
      );
    await HospitalResourceRequestController.updateResourceRequestStatus(
      requests[0]._id,
      "Accepted",
    );

    const receivedRequest =
      await HospitalResourceRequestController.getResourceRequestsBySenderHospital(
        hospital._id,
      );

    expect(receivedRequest).toHaveLength(1);
    expect(receivedRequest[0].senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(receivedRequest[0].receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(receivedRequest[0].hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(receivedRequest[0].resourceId._id.toString()).toBe(
      resource._id.toString(),
    );
    expect(receivedRequest[0].requestedQuantity).toBe(5);
    expect(receivedRequest[0].status).toBe("Accepted");
  });

  it("should update request quantity", async () => {
    const hospitalData = createHospital();
    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);
    const requests =
      await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
        hospital._id,
      );
    await HospitalResourceRequestController.updateResourceRequestQuantity(
      requests[0]._id,
      8,
    );

    const receivedRequest =
      await HospitalResourceRequestController.getResourceRequestsBySenderHospital(
        hospital._id,
      );

    expect(receivedRequest).toHaveLength(1);
    expect(receivedRequest[0].senderHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(receivedRequest[0].receiverHospitalId._id.toString()).toBe(
      hospital._id.toString(),
    );
    expect(receivedRequest[0].hospitalResourceId._id.toString()).toBe(
      hospitalResource._id.toString(),
    );
    expect(receivedRequest[0].resourceId._id.toString()).toBe(
      resource._id.toString(),
    );
    expect(receivedRequest[0].requestedQuantity).toBe(8);
    expect(receivedRequest[0].status).toBe("Pending");
  });

  it("should not return anything for incoming request if accepted", async () => {
    const hospitalData = createHospital();

    const hospital = await HospitalController.create(hospitalData);
    const resource = await HospitalResourceController.createResource({
      resourceName: "Ventilator",
    });
    const hospitalResource =
      await HospitalResourceController.createHospitalResource({
        hospitalId: hospital._id,
        resourceId: resource._id,
        inStockQuantity: 10,
        inStockAlertThreshold: 5,
      });

    const mockRequest: IResourceRequestBase = {
      senderHospitalId: hospital._id,
      receiverHospitalId: hospital._id,
      hospitalResourceId: hospitalResource._id,
      resourceId: resource._id,
      requestedQuantity: 5,
      status: "Pending",
    };

    await HospitalResourceRequestController.createResourceRequest(mockRequest);
    const requests =
      await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
        hospital._id,
      );
    await HospitalResourceRequestController.updateResourceRequestStatus(
      requests[0]._id,
      "Accepted",
    );

    const receivedRequest =
      await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
        hospital._id,
      );

    expect(receivedRequest).toHaveLength(0);
  });

});
