import mongoose, { Document, Schema } from "mongoose";

export interface IResourceBase {
    resourceName: string; // Name of the resource
}

export interface IResource extends IResourceBase, Document {}

// using mongo _id instead of our own id

/**
 * Resource Schema
 */
const ResourceSchema = new Schema<IResource>({
  resourceName: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IResource>("Resource", ResourceSchema);