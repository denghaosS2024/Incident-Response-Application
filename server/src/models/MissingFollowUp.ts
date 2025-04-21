import mongoose, { Document, Schema, Types } from "mongoose";
  
export interface IMissingFollowUpReqBody {
    reportId: string
    isSpotted: boolean 
    locationSpotted: string
    datetimeSpotted: Date
    additionalComment: string

}

export interface IMissingFollowUpBase {
    reportId: Types.ObjectId
    isSpotted: boolean 
    locationSpotted: string
    datetimeSpotted: Date
    additionalComment: string

    // TODO: Add Image URL????
}

export interface IMissingFollowUp extends IMissingFollowUpBase, Document {}

export const MissingPersonFollowUpSchema = new Schema({
    reportId: {
        type: Types.ObjectId,
        ref: "MissingPerson",
        required: true
    },
    isSpotted: {
        type: Boolean,
        required: true
    },
    locationSpotted: {
        type: String,
        required: true 
    }, 
    datetimeSpotted: {
        type: Date,
        required: true
    },
    additionalComment: {
        type: String, 
        required: false
    }
})

export default mongoose.model<IMissingFollowUp>(
    "MissingPersonFollowUp",
    MissingPersonFollowUpSchema
)