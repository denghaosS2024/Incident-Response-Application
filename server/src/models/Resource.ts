import mongoose, { Document, Schema } from "mongoose";

export interface IResourceBase {
    resourceId: string; // Unique identifier for the resource
    resourceName: string; // Name of the resource
  }

export interface IResource extends IResourceBase, Document {}

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