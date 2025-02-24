import mongoose, { Schema, Document, Types } from "mongoose";
import AutoPopulate from 'mongoose-autopopulate'
import { IUser } from './User'

export interface IFile extends Document {
    filename: string;
    length: number;
    chunkSize: number;
    uploadDate: Date;
    contentType: string;
    metadata?: {
        sender: IUser
        timestamp: string
        channelId: Types.ObjectId
    };
}

const FileSchema = new Schema(
    { 
      filename: { type: String, required: true },
      length: { type: Number, required: true },
      chunkSize: { type: Number, required: true },
      uploadDate: { type: Date, default: Date.now },
      contentType: { type: String, required: true },
      content: { type: String, required: true },
      metadata:{
        sender: { type: Schema.Types.ObjectId, required: false, ref: 'User', autopopulate: { select: '-password -__v'}},
        channelId: { type: Schema.Types.ObjectId, required: true, ref: 'Channel', autopopulate: false},
        timestamps: { createdAt: 'timestamp', updatedAt: false},
      },
    }
)
  
FileSchema.plugin(AutoPopulate)
export default mongoose.model<IFile>("File", FileSchema, "fs.files");

