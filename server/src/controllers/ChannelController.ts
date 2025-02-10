// ChannelController handles operations related to channels, such as creating, listing, and appending messages.
// It interacts with the Channel and User models and manages user connections.

import { FilterQuery, Types } from 'mongoose'
import Channel, { IChannel, PUBLIC_CHANNEL_NAME } from '../models/Channel'
import User from '../models/User'
import Message from '../models/Message'
import UserConnections from '../utils/UserConnections'

class ChannelController {
  /**
   * Create a new channel or return an existing one if it already exists
   * @param channel - An object containing channel details
   * @param channel.name - Optional name for the channel
   * @param channel.userIds - Array of user IDs to be added to the channel
   * @returns The created or existing channel object
   * @throws Error if trying to create a channel with the public channel name
   */
  create = async (channel: { name?: string; userIds: Types.ObjectId[] }) => {
    if (channel.name === PUBLIC_CHANNEL_NAME) {
      throw new Error('Channel name cannot be the public channel name')
    }

    // Remove duplicates and ensure order of user IDs
    const userIds = Array.from(new Set(channel.userIds)).sort((a, b) =>
      a.toHexString().localeCompare(b.toHexString()),
    )
    const users = await Promise.all(
      userIds.map(async (id) => (await User.findById(id).exec())!),
    )

    // Check if the channel already exists
    const exists = await Channel.findOne({
      users,
      name: {
        $ne: PUBLIC_CHANNEL_NAME,
      },
    }).exec()

    if (exists) {
      return exists
    } else {
      // Create a new channel if it doesn't exist
      return new Channel({
        name: channel.name,
        users,
      }).save()
    }
  }

  /**
   * List channels, optionally filtered by user
   * @param hasUser - Optional user ID to filter channels
   * @returns An array of channel objects, excluding their messages
   */
  list = async (hasUser?: Types.ObjectId) => {
    let query: FilterQuery<IChannel> = {}

    if (hasUser) {
      const user = await User.findById(hasUser).exec()

      if (user) {
        query = {
          users: user,
        }
      }
    }

    return Channel.find(query)
      .select('-messages') // Exclude messages when listing channels
      .exec()
  }

  /**
   * Get a channel by ID
   * @param id - The ID of the channel to retrieve
   * @returns The channel object if found, null otherwise
   */
  get = async (id: Types.ObjectId) => Channel.findById(id).exec()

  /**
   * Add a new message to a channel and notify online users
   * @param content - The content of the message
   * @param senderId - The ID of the user sending the message
   * @param channelId - The ID of the channel to add the message to
   * @returns The newly created message object
   * @throws Error if the sender or channel is not found
   */
  appendMessage = async ({
    content,
    senderId,
    channelId,
  }: {
    content: string
    senderId: Types.ObjectId
    channelId: Types.ObjectId
  }) => {
    const sender = await User.findById(senderId).exec()
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`)
    }

    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`)
    }

    // Create and save the new message
    const message = await new Message({
      content,
      sender,
      channelId: channel._id,
    }).save()

    // Add the message to the channel
    channel.messages!.push(message)
    await channel.save()

    // Notify other online users in the channel
    channel.users.forEach((user) => {
      if (user._id.equals(senderId)) return

      const id = user._id.toHexString()
      if (!UserConnections.isUserConnected(id)) return

      const connection = UserConnections.getUserConnection(id)!
      connection.emit('new-message', message)
    })

    return message
  }

  /**
   * Get messages for a channel
   * @throws Error as this method is not implemented yet
   */
  getMessages = async () => {
    // TODO: Implement this method to retrieve messages for a channel
    throw new Error('Not Implemented')
  }
}

export default new ChannelController()
