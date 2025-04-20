import { Router } from "express";
import { Types } from "mongoose";
import HospitalResourceRequestController from "../controllers/HospitalResourceRequestController";

import HttpError from "../utils/HttpError";

import { HospitalResourceRequestClient } from "../controllers/HospitalResourceRequestController";
import HospitalResourceController from "../controllers/HospitalResourceController";
import { IResourceRequestBase } from "../models/HospitalResourceRequest";

export default Router()
  .post("/", async (request, response) => {
    try {
      const hospitalResourceRequest: HospitalResourceRequestClient =
        request.body;

      const {
        senderHospitalId,
        receiverHospitalId,
        hospitalResourceId,
        resourceName,
        requestedQuantity,
      } = hospitalResourceRequest;

      if (
        !senderHospitalId ||
        !resourceName ||
        !hospitalResourceId ||
        receiverHospitalId === undefined
      ) {
        throw new HttpError(
          "senderHospitalId, resourceName, receiverHospitalId, and hospitalResourceId are mandatory fields.",
          400,
        );
      }

      if (requestedQuantity <= 0) {
        throw new HttpError(
          "The requested quantity should be greater than 0.",
          400,
        );
      }

      // Step 1: Call the controller to get the resource that belongs to the receiver
      const resource = await HospitalResourceController.createResource({
        resourceName,
      });

      const hospitalResource =
        await HospitalResourceController.getHospitalResourceByIds(
          resource._id,
          new Types.ObjectId(receiverHospitalId),
        );

      const payload: IResourceRequestBase = {
        receiverHospitalId: new Types.ObjectId(receiverHospitalId),
        senderHospitalId: new Types.ObjectId(senderHospitalId),
        hospitalResourceId: hospitalResource._id,
        resourceId: resource._id,
        requestedQuantity: requestedQuantity,
        status: "Pending",
      };

      const newRequest =
        await HospitalResourceRequestController.createResourceRequest(payload);

      return response.status(201).send(newRequest);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .get("/:hospitalId/incoming", async (request, response) => {
    const hospitalId = request.params.hospitalId;

    try {
      const incomingRequests =
        await HospitalResourceRequestController.getResourceRequestsByReceiverHospital(
          new Types.ObjectId(hospitalId),
        );

      return response.status(200).send(incomingRequests);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .get("/:hospitalId/outgoing", async (request, response) => {
    const hospitalId = request.params.hospitalId;

    try {
      const outgoingRequests =
        await HospitalResourceRequestController.getResourceRequestsBySenderHospital(
          new Types.ObjectId(hospitalId),
        );

      return response.status(200).send(outgoingRequests);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .put("/:requestId/requested-quantity", async (request, response) => {
    const requestId = request.params.requestId;
    const { requestedQuantity } = request.body;
    try {
      const updatedResourceRequest =
        await HospitalResourceRequestController.updateResourceRequestQuantity(
          new Types.ObjectId(requestId),
          requestedQuantity as number,
        );

      if (!updatedResourceRequest) {
        throw new HttpError("HospitalResource not found.", 404);
      }

      return response.status(200).send(updatedResourceRequest);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  .get("/:requestId", async (request, response) => {
    const requestId = request.params.requestId;

    try {
      const reosurceRequest =
        await HospitalResourceRequestController.getResourceRequestById(
          new Types.ObjectId(requestId),
        );

      return response.status(200).send(reosurceRequest);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  });

  
