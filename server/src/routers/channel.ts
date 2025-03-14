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
 *               description:
 *                type: string
 *               owner:
 *                type: string
 *               closed:
 *                type: boolean
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
 *
 *   delete:
 *     summary: Delete a channel
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
 *
 *     responses:
 *       200:
 *         description: Channel deleted
 *
 *       400:
 *         description: Invalid request
 *
 */

export default Router()
  /**
   * Delete a channel
   * @route DELETE /api/channels
   * @param {Object} request.body
   * @param {string} request.body.name - Name of the channel to delete
   * @returns {string} Success message
   * @throws {400} If the channel name is not provided
   */
  .delete('/', async (request, response) => {
    const { name } = request.body as { name: string }
    if (!name) {
      return response.status(400).send({ message: 'Channel name is required' })
    }

    try {
      await ChannelController.delete(name)
      return response.send({ message: `Channel(${name}) deleted` })
    } catch (e) {
      const error = e as Error
      return response.status(400).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/channels/911:
   *   post:
   *     summary: Create a new 911 emergency channel
   *     description: Creates a specialized channel for 911 emergency communication with automatic system message
   *     tags: [Channels]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - userId
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username of the caller
   *               userId:
   *                 type: string
   *                 format: uuid
   *                 description: MongoDB ObjectId of the caller
   *     responses:
   *       200:
   *         description: 911 emergency channel created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Channel'
   *       400:
   *         description: Bad request - missing required fields or invalid data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  .post('/911', async (request, response) => {
    const { username, userId } = request.body;
    try {
      const channel = await ChannelController.create911Channel(
        username,
        new Types.ObjectId(userId)
      );
      response.status(201).send(channel);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })


  /**
   * @swagger
   * /api/channels:
   *   post:
   *     summary: Create channel
   *     description: Create a new channel
   *     tags: [Channels]
   *     responses:
   *       200:
   *         description: Channel created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Channel'
   *       500:
   *         description: Server error
   */
  /**
   * Create a new channel
   * @route POST /api/channels
   * @param {Object} request.body
   * @param {string} [request.body.name] - Name for the channel
   * @param {string[]} request.body.users - Array of user IDs to be added to the channel
   * @param {string} [request.body.description] - Optional description for the channel
   * @param {string} [request.body.owner] - Optional owner ID of the channel
   * @param {boolean} [request.body.closed] - Flag indicating if the channel is closed
   * @returns {Object} The created or existing channel object
   * @throws {400} If trying to create a channel with the public channel name
   */
  .post('/', async (request, response) => {
    const { name, users, description, owner, closed } = request.body as {
      name: string
      users: string[]
      description?: string
      owner?: string
      closed?: boolean
    }
    try {
      const channel = await ChannelController.create({
        name,
        userIds: users.map((userId) => new Types.ObjectId(userId)),
        description: description,
        ownerId: owner ? new Types.ObjectId(owner) : undefined,
        closed: closed,
      })
      response.send(channel);
    } catch (e) {
      const error = e as Error
      console.log(error)
      response.status(400).send({ message: error.message })
    }
  })

    /**
     * @swagger
     * /api/channels:
     *   put:
     *     summary: Update channel
     *     description: Update an existing channel
     *     tags: [Channels]
     *     responses:
     *       200:
     *         description: Group updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Channel'
     *       500:
     *         description: Server error
     */
    /**
     * Update existing channel
     * @route PUT /api/channels
     * @param {Object} request.body
     * @param {string} [request.body.name] - Name for the channel
     * @param {string[]} request.body.users - Array of user IDs to be added to the channel
     * @param {string} [request.body.description] - Optional description for the channel
     * @param {string} [request.body.owner] - Optional owner ID of the channel
     * @param {boolean} [request.body.closed] - Flag indicating if the channel is closed
     * @returns {Object} The created or existing channel object
     * @throws {400} If trying to create a channel with the public channel name
     */
    .put('/', async (request, response) => {
      const { _id, name, users, description, owner, closed } = request.body as {
        _id?: string
        name: string
        users: string[]
        description?: string
        owner?: string
        closed?: boolean
      }

      if (!_id) {
        response.status(400).send({ message: 'Channel id is required' });
        return;
      }

      try {
        let channel = await ChannelController.updateChannel({
          _id: new Types.ObjectId(_id),
          name,
          userIds: users.map((userId) => new Types.ObjectId(userId)),
          description,
          ownerId: owner ? new Types.ObjectId(owner) : undefined,
          closed,
        });
        response.status(200).send(channel);
      } catch (e) {
        const error = e as Error;
        response.status(400).send({ message: error.message });
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
    return response.send(channels)
  })

  /**
* @swagger
* /api/channels/groups/closed:
*   get:
*     summary: Get all closed groups
*     description: Retrieve all groups where "closed" is true.
*     tags: [Groups]
*     responses:
*       200:
*         description: Successfully retrieved all closed groups
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/IChannel'
*       500:
*         description: Server error
*/

  /**
   * Get all closed groups
   * @route GET /api/channels/groups/closed
   * @returns {Array} An array of closed group objects
   * @throws {500} If there is a server error
   */
  .get('/groups/closed', async (_, response) => {
    try {
      const closedGroups = await ChannelController.getClosedGroups();
      response.status(200).json(closedGroups);
    } catch (e) {
      const error = e as Error;
      response.status(500).json({ message: error.message });
    }
  })


  /**
   * @swagger
   * /api/channels/groups/{userId}:
   *   get:
   *     summary: Get groups by user ID
   *     description: Get all the groups that the user is a part of and user is a part of
   *     tags: [Groups]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           description: User ID
   *     responses:
   *       200:
   *         description: Groups retrieved successfully
   *       404:
   *         description: User not found
   */

  /**
   * Get groups by user ID
   * @route GET /api/channels/groups/{userId}
   * @param {string} request.params.userId - The ID of the user
   * @returns {Array} An array of group objects that the user is a part of and user is a part of
   * @throws {404} If the user is not found
   */

  .get('/groups/:userId', async (request, response) => {
    const userId = new Types.ObjectId(request.params.userId)
    try {
      let groups = await ChannelController.getUserGroups(userId)
      groups = groups.filter(group => group.name !== "PrivateContact")
      response.status(200).json(groups)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/channels/public/messages:
   *   get:
   *     summary: Redirect to public channel messages
   *     description: Redirect to the public channel's messages endpoint
   *     tags: [Channels]
   *     responses:
   *       308:
   *         description: Redirect to public channel messages
   */
  .get('/public/messages', async (_, response) => {
    const publicChannel = await Channel.getPublicChannel()
    return response.redirect(308, `/api/channels/${publicChannel.id}/messages`)
  })
  /**
   * @swagger
   * /api/:id/messages:
   * post:
   *    summary: Append a message to a channel
   *    description: Append a message to a channel
   *    tags: [Channels]
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: string
   *          description: Channel ID
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *            content:
   *              type: string
   *            isAlert:
   *              type: boolean
   *            responders:
   *              type: array
   *              items:
   *                type: string
   *    responses:
   *      200:
   *        description: Message appended successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Message'
   *      404:
   *        description: Channel not found
   */
  .post('/:id/messages', async (request, response) => {
    const senderId = new Types.ObjectId(
      request.headers['x-application-uid'] as string,
    )
    const { content, isAlert, responders } = request.body

    const channelId = new Types.ObjectId(request.params.id)

    try {
      const message = await ChannelController.appendMessage({
        content,
        senderId,
        channelId,
        isAlert,
        responders,
      })
      response.send(message)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })
  /**
   * @swagger
   * /api/:id/messages:
   *   get:
   *     summary: Get messages for a channel
   *     description: Get messages for a specific channel
   *     tags: [Channels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           description: Channel ID
   *     responses:
   *       200:
   *         description: Successfully retrieved messages for the channel
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
   *       404:
   *         description: Channel not found
   */
  .get('/:id', async (request, response) => {
    try {
      const channelId = new Types.ObjectId(request.params.id)  // will throw error for invalid id
      const channel = await ChannelController.getChannel(channelId)
      response.json(channel)
    } catch (e) {
      const error = e as Error
      response.status(404).json({ message: error.message })
    }
  })
  /**
   * @swagger
   * /api/public/messages:
   *   get:
   *     summary: Redirect to public channel messages
   *     description: Redirect to the public channel's messages endpoint
   *     tags: [Channels]
   *     responses:
   *       308:
   *         description: Redirect to public channel messages
   */
  .get('/public/messages', async (_, response) => {
    const publicChannel = await Channel.getPublicChannel()
    return response.redirect(`/api/channels/${publicChannel.id}/messages`)
  })
  /**
   * @swagger
   * /api/:id/messages:
   *   get:
   *     summary: Get messages for a channel
   *     description: Get messages for a specific channel
   *     tags: [Channels]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           description: Channel ID
   *     responses:
   *       200:
   *         description: Successfully retrieved messages for the channel
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
   *       404:
   *         description: Channel not found
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
   * Start a video conference in a channel
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
   * @swagger
   * /api/channels/{id}/phone-call:
   *   post:
   *     summary: Make a phone call in a channel.
   *     tags: [Channels]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-application-uid
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user making the phone call.
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the channel.
   *     responses:
   *       200:
   *         description: The phone number to call.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 phoneNumber:
   *                   type: string
   *                   description: The phone number to call.
   *       404:
   *         description: Sender or channel not found.
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
  .get('/:id/video-upload-url', async (request, response) => {
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const uploadUrl = await ChannelController.getVideoUploadUrl(channelId)
      response.send(uploadUrl)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/channels/{id}/image-upload-url:
   *   get:
   *     summary: Get a signed URL for uploading an image to a channel.
   *     tags: [Channels]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-application-uid
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user uploading the image.
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the channel.
   *     responses:
   *       200:
   *         description: The signed URL for uploading the image.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 uploadUrl:
   *                   type: string
   *                   description: The signed URL for uploading the image.
   *                 fileUrl:
   *                   type: string
   *                   description: The URL to access the uploaded image.
   *       404:
   *         description: Sender or channel not found.
   */
  .get('/:id/image-upload-url', async (request, response) => {
    const channelId = new Types.ObjectId(request.params.id)

    try {
      const uploadUrl = await ChannelController.getImageUploadUrl(channelId)
      response.send(uploadUrl)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })

  /**
 * @swagger
 * /api/channels/{id}/file-upload-url:
 *   post:
 *     summary: Post a signed URL for uploading a file to a channel.
 *     tags: [Channels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-application-uid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user uploading the file.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the channel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *               - fileExtension
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: The name of the file being uploaded.
 *                 example: "document"
 *               fileType:
 *                 type: string
 *                 description: The MIME type of the file.
 *                 example: "application/pdf"
 *               fileExtension:
 *                 type: string
 *                 description: The file extension.
 *                 example: ".pdf"
 *     responses:
 *       200:
 *         description: The signed URL for uploading the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: The signed URL for uploading the file.
 *                 fileUrl:
 *                   type: string
 *                   description: The URL to access the uploaded file.
 *       400:
 *         description: Bad request if parameters are missing.
 *       404:
 *         description: Sender or channel not found.
 */
  .post('/:id/file-upload-url', async (request, response) => {
    const channelId = new Types.ObjectId(request.params.id)
    const fileName = request.body.fileName
    const fileType = request.body.fileType
    const fileExtension = request.body.fileExtension
    try {
      const uploadUrl = await ChannelController.getFileUploadUrl(
        channelId,
        fileName,
        fileType,
        fileExtension,
      )
      response.send(uploadUrl)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })

  /**
 * @swagger
 * /api/channels/{id}/voice-upload-url:
 *   post:
 *     summary: Post a signed URL for uploading a voice message to a channel.
 *     tags: [Channels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-application-uid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user uploading the file.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the channel.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: The name of the voice recording being uploaded.
 *                 example: "recording"
 *     responses:
 *       200:
 *         description: The signed URL for uploading the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: The signed URL for uploading the file.
 *       400:
 *         description: Bad request if parameters are missing.
 *       404:
 *         description: Sender or channel not found.
 */
  .post('/:id/voice-upload-url', async (request, response) => {
    const channelId = new Types.ObjectId(request.params.id)
    const fileName = request.body.fileName
    try {
      const uploadUrl = await ChannelController.getVoiceUploadUrl(
        channelId,
        fileName,
      )
      response.send(uploadUrl)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })
  /**
   * @swagger
   * /api/channels/{id}/messages/acknowledge:
   *   patch:
   *     summary: Acknowledge a message in a channel.
   *     tags: [Channels]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the channel.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - senderId
   *               - messageId
   *             properties:
   *               senderId:
   *                 type: string
   *                 description: The ID of the user acknowledging the message.
   *               messageId:
   *                 type: string
   *                 description: The ID of the message to acknowledge.
   *     responses:
   *       200:
   *         description: The updated message object.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Message'
   *       404:
   *         description: Sender, message, or channel not found.
   */
  .patch('/:id/messages/acknowledge', async (request, response) => {
    const channelId = new Types.ObjectId(request.params.id)
    const { senderId, messageId } = request.body
    // const messageId = new Types.ObjectId(request.params.messageId)
    try {
      const updatedMessage = await ChannelController.acknowledgeMessage(
        messageId,
        senderId,
        channelId,
      )
      response.send(updatedMessage)
    } catch (e) {
      const error = e as Error
      response.status(404).send({ message: error.message })
    }
  })




