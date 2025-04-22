import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMissingFollowUpReqBody {
  reportId: string;
  isSpotted: boolean;
  locationSpotted: string;
  datetimeSpotted: Date;
  additionalComment: string;
  photo?: string;
}

export interface IMissingFollowUpBase {
  reportId: Types.ObjectId;
  isSpotted: boolean;
  locationSpotted: string;
  datetimeSpotted: Date;
  additionalComment: string;

  // TODO: Add Image URL????
  photo?: string;
}

export interface IMissingFollowUp extends IMissingFollowUpBase, Document {}

export const MissingPersonFollowUpSchema = new Schema({
  reportId: {
    type: Types.ObjectId,
    ref: "MissingPerson",
    required: true,
  },
  isSpotted: {
    type: Boolean,
    required: true,
  },
  locationSpotted: {
    type: String,
    required: false,
  },
  datetimeSpotted: {
    type: Date,
    required: true,
  },
  additionalComment: {
    type: String,
    required: false,
  },
  photo: {
    type: String,
  },
},
{
    timestamps: {
      createdAt: "timestamp",
      updatedAt: false,
    },
  },);

export default mongoose.model<IMissingFollowUp>(
  "MissingPersonFollowUp",
  MissingPersonFollowUpSchema,
);
