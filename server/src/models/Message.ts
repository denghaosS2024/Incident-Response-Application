/**
 * Message Model
 *
 * Represents a message sent by a user in a channel.
 */

import mongoose, { Schema, Document, Types } from 'mongoose'
import AutoPopulate from 'mongoose-autopopulate'

import { IUser } from './User'

/**
 * Interface for the Message document
 */
export interface IMessage extends Document {
  content: string
  sender: IUser
  timestamp: string
  channelId: Types.ObjectId
  isAlert: boolean
}

/**
 * Message Schema
 */
const MessageSchema = new Schema(
  {
    content: { type: String, required: true },
    sender: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'User',
      autopopulate: {
        select: '-password -__v',
      },
    },
    channelId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Channel',
      autopopulate: false,
    },
    isAlert: {
      type:Boolean, require:true,
    }
  },
  {
    timestamps: {
      createdAt: 'timestamp',
      updatedAt: false,
    },
  },
)

MessageSchema.plugin(AutoPopulate)

export default mongoose.model<IMessage>('Message', MessageSchema)
