/**
 * Channel Model
 *
 * Represents a channel where users can send messages.
 * This model is similar to a Slack channel.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'
import AutoPopulate from 'mongoose-autopopulate'

import { IUser } from './User'
import { IMessage } from './Message'

export const PUBLIC_CHANNEL_NAME = 'Public'

/**
 * Interface for the Channel document
 */
export interface IChannel extends Document {
  name: string
  description?: string
  owner?: IUser
  closed: boolean
  users: IUser[]
  messages?: IMessage[]
}

/**
 * Interface for the Channel model
 */
export interface IChannleModel extends Model<IChannel> {
  getPublicChannel: () => Promise<IChannel>
}

/**
 * Channel Schema
 */
const ChannelSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: {
      select: '-password -__v',
    },
  },
  closed: { type: Boolean, default: false },
  users: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      autopopulate: {
        select: '-password -__v',
      },
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Message',
      autopopulate: true,
    },
  ],
})

ChannelSchema.plugin(AutoPopulate)

/**
 * Static method to get or create the public channel
 */
ChannelSchema.statics.getPublicChannel = async () => {
  const channel = await Channel.findOne({ name: PUBLIC_CHANNEL_NAME }).exec()

  if (channel) {
    return channel
  } else {
    return new Channel({ name: PUBLIC_CHANNEL_NAME }).save()
  }
}

const Channel = mongoose.model<IChannel, IChannleModel>(
  'Channel',
  ChannelSchema,
)

export default Channel
