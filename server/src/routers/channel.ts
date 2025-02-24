// ChannelRouter handles operations related to channels, such as creating, listing, and appending messages.
// It interacts with the Channel and User models and manages user connections.
import { Router } from 'express'
import { Types } from 'mongoose'

import ChannelController from '../controllers/ChannelController'
import Channel from '../models/Channel'

/**
 * @swagger
 * tags:
 *   name: Channels
 *   description: Channel management and messaging API
 *
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       required:
 *         - users
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the channel
 *         name:
 *           type: string
 *           description: Optional name for the channel
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs in the channel
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *     Message:
 *       type: object
 *       required:
 *         - content
 *         - sender
 *         - timestamp
 *         - channelId
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *         sender:
 *           type: string
 *           description: ID of the user sending the message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Time when the message was sent
 *         channelId:
 *           type: string
 *           format: uuid
 *           description: ID of the channel to which the message belongs
 *
 * /api/channels:
 *   post:
 *     summary: Create a new channel
 *     tags: [Channels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The created channel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       400:
 *         description: Invalid request
 *
 *   get:
 *     summary: List all channels
 *     tags: [Channels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter channels by user ID
 *     responses:
 *       200:
 *         description: List of channels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Channel'
 */

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
   * @swagger
   * /api/channels/{id}/video-conference:
   *   post:
   *     summary: Start a video conference in a channel.
   *     tags: [Channels]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-application-uid
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user starting the video conference.
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the channel.
   *     responses:
   *       200:
   *         description: The newly created message containing the video conference link.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Message'
   *       404:
   *         description: Sender or channel not found.
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
  /**
   * Make a phone call in a channel
   * @route POST /api/channels/:id/phone-call
   * @param {string} request.params.id - The ID of the channel
   * @returns {string, string} The message indicating the call is being made and phone number to call
   * @throws {404} If the channel is not found
   */
  .post('/:id/phone-call', async (request, response) => {
    const senderId = new Types.ObjectId(
      request.headers['x-application-uid'] as string,
    )
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const result = await ChannelController.makePhoneCall(
        channelId,
        senderId,
      )
      response.send(result)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/channels/{id}/video-upload-url:
   *   get:
   *     summary: Get a signed URL for uploading a video to a channel.
   *     tags: [Channels]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-application-uid
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user uploading the video.
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the channel.
   *     responses:
   *       200:
   *         description: The signed URL for uploading the video.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 uploadUrl:
   *                   type: string
   *                   description: The signed URL for uploading the video.
   *                 fileUrl:
   *                   type: string
   *                   description: The URL to access the uploaded video.
   *       404:
   *         description: Sender or channel not found.
   */
  .get('/:id/video-upload-url', async(request, response) => {
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const uploadUrl = await ChannelController.getVideoUploadUrl(
        channelId,
      )
      response.send(uploadUrl)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })