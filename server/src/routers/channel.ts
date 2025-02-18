// ChannelRouter handles operations related to channels, such as creating, listing, and appending messages.
// It interacts with the Channel and User models and manages user connections.

import { Router } from 'express'
import { Types } from 'mongoose'

import ChannelController from '../controllers/ChannelController'
import Channel from '../models/Channel'

export default Router()
  /**
   * Create a new channel
   * @route POST /api/channels
   * @param {Object} request.body
   * @param {string} [request.body.name] - Optional name for the channel
   * @param {string[]} request.body.users - Array of user IDs to be added to the channel
   * @returns {Object} The created or existing channel object
   * @throws {400} If trying to create a channel with the public channel name
   */
  .post('/', async (request, response) => {
    const { name, users } = request.body as {
      name?: string
      users: string[]
    }
    try {
      const channel = await ChannelController.create({
        name,
        userIds: users.map((userId) => new Types.ObjectId(userId)),
      })

      response.send(channel)
    } catch (e) {
      const error = e as Error
      response.status(400).send({ message: error.message })
    }
  })
  /**
   * List channels
   * @route GET /api/channels
   * @param {string} [request.query.user] - Optional user ID to filter channels
   * @returns {Array} An array of channel objects, excluding their messages
   */
  .get('/', async (request, response) => {
    const user = request.query['user'] as string | undefined
    const channels = await ChannelController.list(
      user ? new Types.ObjectId(user) : undefined,
    )

    response.send(channels)
  })
  /**
   * Redirect public channel messages to the appropriate endpoint
   * @route POST /api/channels/public/messages
   * @returns {308} Redirect to the public channel's messages endpoint
   */
  .post('/public/messages', async (_, response) => {
    const publicChannel = await Channel.getPublicChannel()
    return response.redirect(308, `/api/channels/${publicChannel.id}/messages`)
  })
  /**
   * Append a new message to a channel
   * @route POST /api/channels/:id/messages
   * @param {string} request.params.id - The ID of the channel
   * @param {string} request.headers['x-application-uid'] - The ID of the user sending the message
   * @param {Object} request.body
   * @param {string} request.body.content - The content of the message
   * @returns {Object} The newly created message object
   * @throws {404} If the sender or channel is not found
   */
  .post('/:id/messages', async (request, response) => {
    const senderId = new Types.ObjectId(
      request.headers['x-application-uid'] as string,
    )
    const { content } = request.body
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const message = await ChannelController.appendMessage({
        content,
        senderId,
        channelId,
      })

      response.send(message)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })
  /**
   * Redirect public channel messages to the appropriate endpoint
   * @route GET /api/channels/public/messages
   * @returns {302} Redirect to the public channel's messages endpoint
   */
  .get('/public/messages', async (_, response) => {
    const publicChannel = await Channel.getPublicChannel()
    return response.redirect(`/api/channels/${publicChannel.id}/messages`)
  })
  /**
   * List messages in a channel
   * @route GET /api/channels/:id/messages
   * @param {string} request.params.id - The ID of the channel
   * @returns {Array} An array of message objects for the specified channel
   * @throws {404} If the channel is not found
   */
  .get('/:id/messages', async (request, response) => {
    const { id: channelId } = request.params
    const channel = await ChannelController.get(new Types.ObjectId(channelId))

    if (!channel) {
      return response
        .status(404)
        .send({ message: `Channel(${channelId}) not found.` })
    }

    return response.send(channel.messages)
  })
  /**
   * Start a video conference in a channel.
   * @route POST /api/channels/:id/video-conference
   * @param {string} request.headers.x-application-uid - The ID of the user starting the video conference.
   * @param {string} request.params.id - The ID of the channel.
   * @returns {Object} The newly created message containing the video conference link.
   * @throws {404} If the sender or channel is not found.
   */
  .post('/:id/video-conference', async (request, response) => {
    const senderId = new Types.ObjectId(
      request.headers['x-application-uid'] as string,
    )
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const message = await ChannelController.startVideoConference(
        channelId,
        senderId,
      )
      response.send(message)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })
