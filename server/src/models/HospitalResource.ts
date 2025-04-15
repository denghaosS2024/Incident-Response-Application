import mongoose, { Document, Schema } from "mongoose";

export interface IHospitalResourceBase {
  resourceId: string; // Foreign key to Resource entity
  hospitalId: string; // Foreign key to Hospital entity
  inStockQuantity: number; // Quantity in stock
  inStockAlertThreshold?: number; // Optional alert threshold
}

export interface IHospitalResource extends IHospitalResourceBase, Document {}

/**
 * HospitalResource Schema
 */
const HospitalResourceSchema = new Schema<IHospitalResource>({
  resourceId: {
    type: String,
    ref: "Resource", // Reference to Resource entity
    required: true,
  },
  hospitalId: {
    type: String,
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
  HospitalResourceSchema
);

