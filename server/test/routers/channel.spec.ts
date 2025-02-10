import request from 'supertest'

import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'
import { PUBLIC_CHANNEL_NAME } from '../../src/models/Channel'
import UserController from '../../src/controllers/UserController'

describe('Router - Channel', () => {
  let userA: string
  let userB: string
  let userC: string
  let channelId: string
  let messageId: string

  beforeAll(async () => {
    TestDatabase.connect()

    userA = (
      await UserController.register('Channel-User-A', 'password-A')
    )._id.toHexString()
    userB = (
      await UserController.register('Channel-User-B', 'password-B')
    )._id.toHexString()
    userC = (
      await UserController.register('Channel-User-C', 'password-C')
    )._id.toHexString()
  })

  it('creates a new channel', async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post('/api/channels')
      .send({
        users: [userA, userB],
      })
      .expect(200)

    expect(_id).toBeDefined()
    expect(users.length).toBe(2)
    expect(users[0].password).not.toBeDefined()

    channelId = _id
  })

  it('returns the existing channel if users are essentially the same', async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post('/api/channels')
      .send({
        users: [userB, userA],
      })
      .expect(200)

    expect(_id).toBe(channelId)
    expect(users.length).toBe(2)
  })

  it('does not allow to create the public channel manually', async () => {
    await request(app)
      .post('/api/channels')
      .send({ name: PUBLIC_CHANNEL_NAME, users: [] })
      .expect(400)
  })

  it('lists existing channels', async () => {
    const { body: channels } = await request(app)
      .get('/api/channels')
      .expect(200)

    // public channel and the newly created channel
    expect(channels.length).toBe(2)
  })

  it('lists existing channels that a user joined', async () => {
    const { body: channels } = await request(app)
      .get(`/api/channels?user=${userC}`)
      .expect(200)

    // only the public channel
    expect(channels.length).toBe(1)
  })

  it('appends a new message into the channel', async () => {
    const content = 'this is a simple message'
    const { body: message } = await request(app)
      .post(`/api/channels/${channelId}/messages`)
      .set('x-application-uid', userA)
      .send({ content })
      .expect(200)

    messageId = message._id

    expect(messageId).toBeDefined()
    expect(message.content).toBe(content)
    expect(message.sender._id).toBe(userA)
    expect(message.timestamp).toBeDefined()
  })

  it('lists all messages in the channel', async () => {
    const { body: messages } = await request(app)
      .get(`/api/channels/${channelId}/messages`)
      .expect(200)

    expect(messages.length).toBe(1)
    expect(messages[0]._id).toBe(messageId)
  })

  afterAll(TestDatabase.close)
})
