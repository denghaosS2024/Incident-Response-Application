import { Router } from "express";
import { Types } from "mongoose";
import HospitalResourceRequestController from "../controllers/HospitalResourceRequestController";

import HttpError from "../utils/HttpError";

import HospitalResourceController from "../controllers/HospitalResourceController";
import { HospitalResourceRequestClient } from "../controllers/HospitalResourceRequestController";
import {
  IHospitalResource,
  IHospitalResourceBase,
} from "../models/HospitalResource";
import { IResourceRequestBase } from "../models/HospitalResourceRequest";
import UserConnections from "../utils/UserConnections";

export default Router()
  /**
   * @swagger
   * /api/hospital-resources-requests/:
   *   post:
   *     summary: Create a new hospital resource request
   *     description: Creates a new resource request between hospitals.
   *     tags:
   *       - Hospital Resource Requests
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               senderHospitalId:
   *                 type: string
   *                 description: The ID of the sender hospital.
   *               receiverHospitalId:
   *                 type: string
   *                 description: The ID of the receiver hospital.
   *               hospitalResourceId:
   *                 type: string
   *                 description: The ID of the hospital resource.
   *               resourceName:
   *                 type: string
   *                 description: The name of the resource being requested.
   *               requestedQuantity:
   *                 type: number
   *                 description: The quantity of the resource being requested.
   *     responses:
   *       201:
   *         description: Resource request created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HospitalResourceRequest'
   *       400:
   *         description: Bad request. Missing or invalid parameters.
   *       500:
   *         description: Internal server error.
   */
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

  /**
   * @swagger
   * /api/hospital-resources-requests/{hospitalId}/incoming:
   *   get:
   *     summary: Get incoming resource requests
   *     description: Retrieves all incoming resource requests for a specific hospital.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the hospital.
   *     responses:
   *       200:
   *         description: A list of incoming resource requests.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Hospital not found.
   *       500:
   *         description: Internal server error.
   */
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

  /**
   * @swagger
   * /api/hospital-resources-requests/{hospitalId}/outgoing:
   *   get:
   *     summary: Get outgoing resource requests
   *     description: Retrieves all outgoing resource requests for a specific hospital.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the hospital.
   *     responses:
   *       200:
   *         description: A list of outgoing resource requests.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Hospital not found.
   *       500:
   *         description: Internal server error.
   */
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
  /**
   * @swagger
   * /api/hospital-resources-requests/{requestId}/requested-quantity:
   *   put:
   *     summary: Update requested quantity
   *     description: Updates the requested quantity for a specific resource request.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the resource request.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               requestedQuantity:
   *                 type: number
   *                 description: The updated quantity of the resource being requested.
   *     responses:
   *       200:
   *         description: Requested quantity updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Resource request not found.
   *       500:
   *         description: Internal server error.
   */
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
  /**
   * @swagger
   * /api/hospital-resources-requests/{requestId}:
   *   get:
   *     summary: Get a specific resource request
   *     description: Retrieves a specific resource request by its ID.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the resource request.
   *     responses:
   *       200:
   *         description: The requested resource request.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Resource request not found.
   *       500:
   *         description: Internal server error.
   */
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
  })

  /**
   * @swagger
   * /api/hospital-resources-requests/{requestId}/status/accepted:
   *   put:
   *     summary: Update request status to Accepted
   *     description: Updates the request status to Accepted.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the resource request.
   *     responses:
   *       200:
   *         description: Requested status updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Resource request not found.
   *       500:
   *         description: Internal server error.
   */
  .put("/:requestId/status/accepted", async (request, response) => {
    const requestId = request.params.requestId;
    const statusToUpdate = "Accepted";
    try {
      // get current resource request
      const resourceRequest =
        await HospitalResourceRequestController.getResourceRequestById(
          new Types.ObjectId(requestId),
        );

      // get the approving hospital's resource document to extract quantity
      const hospitalApprovingResource =
        await HospitalResourceController.getHospitalResourceByIds(
          resourceRequest.resourceId,
          resourceRequest.receiverHospitalId,
        );

      if (
        resourceRequest.requestedQuantity <=
        hospitalApprovingResource.inStockQuantity
      ) {
        const updatedResourceRequest =
          await HospitalResourceRequestController.updateResourceRequestStatus(
            new Types.ObjectId(requestId),
            statusToUpdate,
          );

        if (!updatedResourceRequest) {
          throw new HttpError("HospitalResource not found.", 404);
        }

        // update sender hospital's resource amount
        // 1. check if sender hospital has the resource
        // 1.1 if they don't then create new resource with this amount
        // 1.2 if they do, then update their existing one
        const potentialSenderHospitalResource =
          await HospitalResourceController.getHospitalResourceByIdsNotFoundOk(
            resourceRequest.resourceId,
            resourceRequest.senderHospitalId,
          );
        if (!potentialSenderHospitalResource) {
          // create new hospital resource for sender hospital
          const hospitalResourceData: IHospitalResourceBase = {
            resourceId: resourceRequest.resourceId,
            hospitalId: resourceRequest.senderHospitalId,
            inStockQuantity: resourceRequest.requestedQuantity,
            inStockAlertThreshold: 0,
          };

          await HospitalResourceController.createHospitalResource(
            hospitalResourceData,
          );
        } else {
          const senderHospitalResourceToUpdate: Partial<IHospitalResource> = {
            hospitalId: resourceRequest.senderHospitalId,
            resourceId: resourceRequest.resourceId,
            inStockQuantity:
              potentialSenderHospitalResource.inStockQuantity +
              resourceRequest.requestedQuantity,
          };
          await HospitalResourceController.updateHospitalResource(
            senderHospitalResourceToUpdate,
          );
        }

        // update receiving hospital's resource amount
        const receiverHospitalResourceToUpdate: Partial<IHospitalResource> = {
          hospitalId: resourceRequest.receiverHospitalId,
          resourceId: resourceRequest.resourceId,
          inStockQuantity:
            hospitalApprovingResource.inStockQuantity -
            resourceRequest.requestedQuantity,
        };
        await HospitalResourceController.updateHospitalResource(
          receiverHospitalResourceToUpdate,
        );

        console.log("ResourceRequest", resourceRequest);
        // send notification to sender hospital
        UserConnections.broadcastToHospitalRoom(
          resourceRequest.senderHospitalId._id.toString(),
          "hospital-nurse-request-anwsered",
          { message: `Your request to has been accepted.`, accepted: true },
        );

        return response.status(200).send(updatedResourceRequest);
      } else {
        throw new HttpError(
          "Unable to fulfill because your post-approval quantity would be too low",
          400,
        );
      }
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/hospital-resources-requests/{requestId}/status/rejected:
   *   put:
   *     summary: Update request status to Rejected
   *     description: Updates the request status to Rejected.
   *     tags:
   *       - Hospital Resource Requests
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the resource request.
   *     responses:
   *       200:
   *         description: Requested status updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HospitalResourceRequest'
   *       404:
   *         description: Resource request not found.
   *       500:
   *         description: Internal server error.
   */
  .put("/:requestId/status/rejected", async (request, response) => {
    const requestId = request.params.requestId;
    const statusToUpdate = "Rejected";
    try {
      const resourceRequest =
        await HospitalResourceRequestController.getResourceRequestById(
          new Types.ObjectId(requestId),
        );
      const updatedResourceRequest =
        await HospitalResourceRequestController.updateResourceRequestStatus(
          new Types.ObjectId(requestId),
          statusToUpdate,
        );

      if (!updatedResourceRequest) {
        throw new HttpError("HospitalResource not found.", 404);
      }
      console.log("ResourceRequest", resourceRequest);
      // send notification to sender hospital
      UserConnections.broadcastToHospitalRoom(
        resourceRequest.senderHospitalId._id.toString(),
        "hospital-nurse-request-anwsered",
        {
          message: `Your request to has been reject.`,
          accepted: false,
        },
      );

      return response.status(200).send(updatedResourceRequest);
    } catch (e) {
      if (e instanceof HttpError) {
        return response.status(e.statusCode).send({ message: e.message });
      }
      const error = e as Error;
      return response.status(500).send({ message: error.message });
    }
  });
