import mongoose, { Document, Schema, Types } from "mongoose";
  
export interface MissingFollowUp extends Document {
    reportId: Types.ObjectId
    isSpotted: boolean 
    locationSpotted: string
    datetimeSpotted: Date
    additionalComment: string

    // TODO: Add Image URL????
}

export const MissingPersonFollowUpSchema = new Schema({
    reportId: {
        type: Types.ObjectId,
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

export default mongoose.model<MissingFollowUp>(
    "MissingPersonFollowUp",
    MissingPersonFollowUpSchema
)