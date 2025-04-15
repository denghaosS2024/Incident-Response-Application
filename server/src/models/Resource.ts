import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface for the Resource document
 */
export interface IResource extends Document {
  resourceId: string; // Unique identifier for the resource, use ObjectId.toString() to make it consist to our whole system
  resourceName: string; // Name of the resource
  // Extendable fields (e.g., description, category, etc.)
}

/**
 * Resource Schema
 */
const ResourceSchema = new Schema<IResource>({
  resourceId: {
    type: String,
    required: true,
    unique: true,
  },
  resourceName: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IResource>("Resource", ResourceSchema);