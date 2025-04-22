import { LeanDocument, Types } from "mongoose";
import ResourceRequest, {
  IResourceRequest,
  IResourceRequestBase,
} from "../models/HospitalResourceRequest";
import HttpError from "../utils/HttpError";
import UserConnections from "../utils/UserConnections";

export interface HospitalResourceRequestClient {
  senderHospitalId: string; // Reference to the sender Hospital's _id
  receiverHospitalId: string; // Reference to the receiver Hospital's _id
  hospitalResourceId: string; // Reference to the HospitalResource's _id
  resourceName: string; // Reference to the Resource's _id
  requestedQuantity: number; // Requested quantity of the resource
  status: "Pending" | "Accepted" | "Rejected"; // Status of the request
}

class ResourceRequestController {
  /**
   * Create a new ResourceRequest
   * @param resourceRequest An object of IResourceRequestBase
   * @returns The newly created resource request object
   */
  async createResourceRequest(
    resourceRequest: IResourceRequestBase,
  ): Promise<LeanDocument<IResourceRequest>> {
    try {
      
      const newResourceRequest = new ResourceRequest({
        senderHospitalId: resourceRequest.senderHospitalId,
        receiverHospitalId: resourceRequest.receiverHospitalId,
        hospitalResourceId: resourceRequest.hospitalResourceId,
        resourceId: resourceRequest.resourceId,
        requestedQuantity: resourceRequest.requestedQuantity,
        status: resourceRequest.status || "Pending", // Default to "Pending"
      });

      await newResourceRequest.save();

      UserConnections.broadcastToHospitalRoom(
        resourceRequest.receiverHospitalId.toString(),
        "hospital-nurse-new-request",
        newResourceRequest.toObject(),
      );

      return newResourceRequest.toObject();
    } catch (error) {
      console.error("Error creating resource request:", error);
      throw new HttpError("Failed to create resource request", 500);
    }
  }

  /**
   * Fetch all ResourceRequests
   * @returns An array of resource request objects
   */
  async getAllResourceRequests(): Promise<LeanDocument<IResourceRequest>[]> {
    try {
      const resourceRequests = await ResourceRequest.find()
        .populate("senderHospitalId")
        .populate("receiverHospitalId")
        .populate("hospitalResourceId")
        .populate("resourceId")
        .lean();

      return resourceRequests;
    } catch (error) {
      console.error("Error fetching all resource requests:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to fetch all resource requests", 500);
    }
  }

  /**
   * Fetch a ResourceRequest by its ID
   * @param id The ID of the resource request
   * @returns The resource request object
   * @throws HttpError if the resource request is not found
   */
  async getResourceRequestById(
    id: Types.ObjectId,
  ): Promise<LeanDocument<IResourceRequest>> {
    try {
      const resourceRequest = await ResourceRequest.findById(id)
        .populate("senderHospitalId")
        .populate("receiverHospitalId")
        .populate("hospitalResourceId")
        .populate("resourceId")
        .lean();

      if (!resourceRequest) {
        throw new HttpError("ResourceRequest not found.", 404);
      }

      return resourceRequest;
    } catch (error) {
      console.error("Error fetching resource request by ID:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to fetch resource request by ID", 500);
    }
  }

  /**
   * Fetch all ResourceRequests by senderHospitalId
   * @param senderHospitalId The ID of the sender hospital
   * @returns An array of resource request objects
   */
  async getResourceRequestsBySenderHospital(
    senderHospitalId: Types.ObjectId,
  ): Promise<LeanDocument<IResourceRequest>[]> {
    try {
      const resourceRequests = await ResourceRequest.find({
        senderHospitalId,
      })
        .populate("senderHospitalId")
        .populate("receiverHospitalId")
        .populate("hospitalResourceId")
        .populate("resourceId")
        .lean();

      return resourceRequests;
    } catch (error) {
      console.error(
        "Error fetching resource requests by sender hospital ID:",
        error,
      );
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError(
        "Failed to fetch resource requests by sender hospital ID",
        500,
      );
    }
  }

  /**
   * Fetch all ResourceRequests by receiverHospitalId
   * @param receiverHospitalId The ID of the receiver hospital
   * @returns An array of resource request objects
   */
  async getResourceRequestsByReceiverHospital(
    receiverHospitalId: Types.ObjectId,
  ): Promise<LeanDocument<IResourceRequest>[]> {
    try {
      const resourceRequests = await ResourceRequest.find({
        receiverHospitalId: receiverHospitalId,
        status: "Pending"
      })
        .populate("senderHospitalId")
        .populate("receiverHospitalId")
        .populate("hospitalResourceId")
        .populate("resourceId")
        .lean();

      return resourceRequests;
    } catch (error) {
      console.error(
        "Error fetching resource requests by receiver hospital ID:",
        error,
      );
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError(
        "Failed to fetch resource requests by receiver hospital ID",
        500,
      );
    }
  }

  /**
   * Update the status of a ResourceRequest
   * @param id The ID of the resource request
   * @param status The new status ("Pending", "Accepted", "Rejected")
   * @returns The updated resource request object
   * @throws HttpError if the resource request is not found
   */
  async updateResourceRequestStatus(
    id: Types.ObjectId,
    status: "Pending" | "Accepted" | "Rejected",
  ): Promise<LeanDocument<IResourceRequest> | null> {
    try {
      const updatedResourceRequest = await ResourceRequest.findByIdAndUpdate(
        id,
        { status }, // Only update the status field
        { new: true }, // Return the updated document
      ).lean();

      if (!updatedResourceRequest) {
        throw new HttpError("ResourceRequest not found.", 404);
      }

      return updatedResourceRequest;
    } catch (error) {
      console.error("Error updating resource request status:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to update resource request status", 500);
    }
  }

  async updateResourceRequestQuantity(
    id: Types.ObjectId,
    requestedQuantity: number,
  ): Promise<LeanDocument<IResourceRequest> | null> {
    try {
      const updatedResourceRequest = await ResourceRequest.findByIdAndUpdate(
        id,
        { requestedQuantity }, // Only update the requestedQuantity field
        { new: true }, // Return the updated document
      ).lean();

      if (!updatedResourceRequest) {
        throw new HttpError("ResourceRequest not found.", 404);
      }

      return updatedResourceRequest;
    } catch (error) {
      console.error("Error updating resource request status:", error);
      if (error instanceof HttpError) {
        throw error; // Re-throw if it's already an HttpError
      }
      throw new HttpError("Failed to update resource request status", 500);
    }
  }
}

export default new ResourceRequestController();
