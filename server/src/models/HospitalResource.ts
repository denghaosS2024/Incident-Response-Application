import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHospitalResourceBase {
  resourceId: Types.ObjectId; // Reference to Resource's _id
  hospitalId: Types.ObjectId; // Reference to Hospital's _id
  inStockQuantity: number; // Quantity in stock
  inStockAlertThreshold?: number; // Optional alert threshold
}

export interface IHospitalResource extends IHospitalResourceBase, Document {}

/**
 * HospitalResource Schema
 */
const HospitalResourceSchema = new Schema<IHospitalResource>({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource", // Reference to Resource entity
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital", // Reference to Hospital entity
    required: true,
  },
  inStockQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  inStockAlertThreshold: {
    type: Number,
    required: false,
  },
});

export default mongoose.model<IHospitalResource>(
  "HospitalResource",
  HospitalResourceSchema,
);
