// ChannelController handles operations related to channels, such as creating, listing, and appending messages.
// It interacts with the Channel and User models and manages user connections.

import { FilterQuery, Types } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import Channel, { IChannel, PUBLIC_CHANNEL_NAME } from '../models/Channel'
import User from '../models/User'
import Message from '../models/Message'
import UserConnections from '../utils/UserConnections'

import { Storage } from '@google-cloud/storage'
import dotenv from 'dotenv'
dotenv.config()

class ChannelController {
  /**
   * Delete a channel by Name (Name had unique constraint)
   * @param name - The name of the channel to delete
   * @returns The deleted channel object
   * @throws Error if trying to delete the public channel or if the channel is not found
   */
  delete = async (name: string) => {
    if (name === PUBLIC_CHANNEL_NAME) {
      throw new Error('Cannot delete the public channel')
    }

    const exists = await Channel.findOne({
      name,
    }).exec()

    if (!exists) {
      throw new Error(`Channel(${name}) not found.`)
    }

    return await Channel.findOneAndDelete({ name }).exec()
  }

  /**
   * Create a new channel or return an existing one if it already exists
   * @param channel - An object containing channel details
   * @param channel.name - Name for the channel
   * @param channel.userIds - Array of user IDs to be added to the channel
   * @param channel.description - Optional description for the channel
   * @param channel.ownerId - The ID of the user creating the channel
   * @param channel.closed - Optional flag to indicate if the channel is closed
   * @returns The created or existing channel object
   * @throws Error if trying to create a channel with the public channel name
   */
  create = async (channel: {
    name: string
    userIds: Types.ObjectId[]
    description?: string
    ownerId?: Types.ObjectId
    closed?: boolean
  }) => {
    console.log("New channel:", channel.name)
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
    let owner
    if (channel.ownerId) {
      owner = await User.findById(channel.ownerId).exec()
    }

    // Check if the channel already exists
    const exists = await Channel.findOne({
      users,
      name:channel.name,
      description: channel.description || '',
      owner: owner,
      closed: channel.closed || false,
    }).exec()

    if (exists) {
      console.log('Channel already exists',
        exists
      )
      return exists
    } else {
      // Create a new channel if it doesn't exist
      console.log('Creating new channel...')
      const newChannel = await new Channel({
        name: channel.name,
        users,
        description: channel.description,
        owner: owner,
        closed: channel.closed,
      }).save()
      UserConnections.broadcast('updateGroups', {})
      return newChannel
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

  /**
   * Start a video conference in a channel.
   * - Retrieves the sender and channel from the database.
   * - Generates a unique room ID and constructs a video conference link (using Jitsi Meet).
   * - Creates a new message with the conference link and appends it to the channel.
   * - Notifies other online users in the channel.
   *
   * @param channelId - The ID of the channel to start the conference in.
   * @param senderId - The ID of the user starting the conference.
   * @returns The newly created message object containing the conference link.
   * @throws Error if the sender or channel is not found.
   */
  startVideoConference = async (
    channelId: Types.ObjectId,
    senderId: Types.ObjectId,
  ) => {
    // Retrieve the sender from the database
    const sender = await User.findById(senderId).exec()
    if (!sender) {
      throw new Error(`Sender(${senderId.toHexString()}) not found.`)
    }

    // Retrieve the channel from the database
    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`)
    }

    // Generate a unique room ID and construct the video conference link
    const roomId = uuidv4()
    const conferenceLink = `https://meet.jit.si/${roomId}`

    const content = `Video conference started! Join here: ${conferenceLink}`

    // Create and save the new message
    const message = await new Message({
      content,
      sender,
      channelId: channel._id,
    }).save()

    // Append the new message to the channel
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
   * Generate a signed URL for uploading a video to Google Cloud Storage.
   * @param channelId - The ID of the channel to upload the video to.
   * @returns An object containing the signed URL and the file URL.
   * @throws Error if the channel is not found.
   *
   */
  getVideoUploadUrl = async (channelId: Types.ObjectId) => {
    // Retrieve the channel from the database
    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`)
    }

    // Initialize Google Cloud Storage
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || 'YOUR_PROJECT_ID',
      keyFilename:
        process.env.GCP_KEY_FILE || 'path/to/your/service-account.json',
    })

    const bucketName = process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name'
    // Generate a unique file name for the video (using channelId and current timestamp)
    const fileName = `videos/${channelId}/${Date.now()}.webm`
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    // Set the signed URL to expire in 15 minutes
    const expires = Date.now() + 15 * 60 * 1000

    try {
      // Generate a signed URL that allows a PUT request for the video upload
      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires,
        contentType: 'video/webm',
      })

      // Construct the public URL for accessing the video after upload
      const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`

      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return { error: 'Error generating signed URL' }
    }
  }

  getFileUploadUrl = async (
    channelId: Types.ObjectId,
    fileName: string,
    fileType: string,
    fileExtension: string,
  ) => {
    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`)
    }

    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || 'YOUR_PROJECT_ID',
      keyFilename:
        process.env.GCP_KEY_FILE || 'path/to/your/service-account.json',
    })

    const bucketName = process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name'
    const fileRoute = `uploads/${channelId}/${fileName}.${Date.now()}.${fileExtension}`
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileRoute)

    const expires = Date.now() + 15 * 60 * 1000

    try {
      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires,
        contentType: fileType,
      })
      const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileRoute}`
      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return { error: 'Error generating signed URL' }
    }
  }

  getVoiceUploadUrl = async (channelId: Types.ObjectId, fileName: string) => {
    const channel = await Channel.findById(channelId).exec()
    if (!channel) {
      throw new Error(`Channel(${channelId.toHexString()}) not found.`)
    }

    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID || 'YOUR_PROJECT_ID',
      keyFilename:
        process.env.GCP_KEY_FILE || 'path/to/your/service-account.json',
    })

    const bucketName = process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name'
    const fileExtension = 'webm'
    const fileRoute = `voice_messages/${channelId}/${fileName}.${Date.now()}.${fileExtension}`
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileRoute)

    const expires = Date.now() + 15 * 60 * 1000

    try {
      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires,
        contentType: 'audio/webm',
      })
      const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileRoute}`
      return { uploadUrl, fileUrl }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return { error: 'Error generating signed URL' }
    }
  }

  getUserGroups = async (userId: Types.ObjectId) => {
    try {
      const groups = await Channel.getGroupByUser(userId)
      return groups
    } catch (error) {
      console.error('Error getting groups:', error)
      throw error
    }
  }
}

export default new ChannelController()
