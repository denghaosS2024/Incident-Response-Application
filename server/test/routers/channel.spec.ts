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

  it('creates a new channel excluding optional fields', async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post('/api/channels')
      .send({
        name: 'Test Channel 1',
        users: [userA, userB],
      })
      .expect(200)

    expect(_id).toBeDefined()
    expect(users.length).toBe(2)
    expect(users[0].password).not.toBeDefined()

    channelId = _id
  })

  it('creates a new channel including optional fields', async () => {
    const {
      body: { _id, users, description, owner, closed },
    } = await request(app)
      .post('/api/channels')
      .send({
        name: 'Test Channel 2',
        description: 'This is a test channel',
        users: [userA, userB],
        owner: userA,
        closed: true,
      })
      .expect(200)

    expect(_id).toBeDefined()
    expect(users.length).toBe(2)
    expect(users[0].password).not.toBeDefined()
    expect(users[1].password).not.toBeDefined()
    expect(description).toBe('This is a test channel')
    expect(owner).toBeDefined()
    expect(closed).toBe(true)
  })

  // Due to schema change and adding mandatory name to channels, this test is redundant
  it.skip('returns the existing channel if users are essentially the same', async () => {
    const {
      body: { _id, users },
    } = await request(app)
      .post('/api/channels')
      .send({
        name: 'test-same-users',
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

  // This is not deterministic
  it.skip('lists existing channels', async () => {
    const { body: channels } = await request(app)
      .get('/api/channels')
      .expect(200)

    // public channel and the newly created channel
    expect(channels.length).toBe(3)
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

  it('can delete a channel', async () => {
    const channelName = 'channel01'
    await request(app)
      .post('/api/channels')
      .send({
        name: channelName,
        users: [userA, userB],
        owner: userA,
      })
      .expect(200)

    const { body } = await request(app)
      .delete(`/api/channels`)
      .send({ name: channelName })
      .expect(200)

    expect(body.message).toBe(`Channel(${channelName}) deleted`)
  })

  afterAll(TestDatabase.close)
})
