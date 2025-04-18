import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResourceRequestBase {
  senderHospitalId: Types.ObjectId; // Reference to the sender Hospital's _id
  receiverHospitalId: Types.ObjectId; // Reference to the receiver Hospital's _id
  hospitalResourceId: Types.ObjectId; // Reference to the HospitalResource's _id
  resourceId: Types.ObjectId; // Reference to the Resource's _id
  requestedQuantity: number; // Requested quantity of the resource
  status: "Pending" | "Accepted" | "Rejected"; // Status of the request
}

export interface IResourceRequest extends IResourceRequestBase, Document {}

/**
 * ResourceRequest Schema
 */
const ResourceRequestSchema = new Schema<IResourceRequest>(
  {
    senderHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // Reference to Hospital entity
      required: true,
    },
    receiverHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // Reference to Hospital entity
      required: true,
    },
    hospitalResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HospitalResource", // Reference to HospitalResource entity
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource", // Reference to Resource entity
      required: true,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1, // Ensure the requested quantity is at least 1
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"], // Enumeration for status
      default: "Pending", // Default status is "Pending"
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

export default mongoose.model<IResourceRequest>(
  "ResourceRequest",
  ResourceRequestSchema,
);
