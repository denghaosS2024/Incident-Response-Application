import request from 'supertest'

import app from '../../src/app'
import * as TestDatabase from '../utils/TestDatabase'
import { PUBLIC_CHANNEL_NAME } from '../../src/models/Channel'
import UserController from '../../src/controllers/UserController'
import { Types } from 'mongoose'
import Profile from '../../src/models/Profile'

jest.mock('@google-cloud/storage', () => {
  const mockGetSignedUrl = jest.fn().mockResolvedValue(['mock-signed-url'])
  const mockFile = jest.fn(() => ({ getSignedUrl: mockGetSignedUrl }))
  const mockBucket = jest.fn(() => ({ file: mockFile }))
  const mockStorage = jest.fn().mockImplementation(() => ({
    bucket: mockBucket,
  }))

  return { Storage: mockStorage }
})

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
      .send({ content: content, isAlert: false })
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


  it('returns a valid video upload URL for an existing channel', async () => {
    // 1) Create a channel in the DB
    const {
      body: { _id },
    } = await request(app)
      .post('/api/channels')
      .send({
        name: 'Test Channel For Upload Route',
        users: [userA],
      })
      .expect(200)
    
    // 2) Call the new GET route
    const { body } = await request(app)
      .get(`/api/channels/${_id}/video-upload-url`)
      .expect(200)

    // 3) Our controller returns { uploadUrl, fileUrl }
    expect(body).toHaveProperty('uploadUrl')
    expect(body).toHaveProperty('fileUrl')
    // We mocked the getSignedUrl to return "mock-signed-url"
    expect(body.uploadUrl).toBe('mock-signed-url')
    // And fileUrl typically starts with https://storage.googleapis.com/
    expect(body.fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//)
  })

  it('returns 404 if the channel does not exist', async () => {
    // Provide a random ID that won’t match any existing channel
    const fakeId = '64f0413bd1fd8a7a6e8a1f21'

    // Expect a 404 and an error message from the catch block
    const { body } = await request(app)
      .get(`/api/channels/${fakeId}/video-upload-url`)
      .expect(404)

    // The error response is { message: error.message }
    expect(body).toHaveProperty('message')
    expect(body.message).toMatch(/Channel.*not found/)
  })


  it('should initiate a phone call between two users and return the phone number', async () => {

    
    // Create profiles for both users with phone numbers
    await Profile.findOneAndUpdate(
      { userId: new Types.ObjectId(userA) },
      { 
        $set: {
          userId: new Types.ObjectId(userA),
          name: "Channel-User-A",
          dob: new Date("1990-01-01"),
          sex: "Male",
          address: "123 Test St",
          phone: "1234567890",
          email: "usera@example.com",
          medicalInfo: {
            condition: "None",
            drugs: "None",
            allergies: "None"
          },
          emergencyContacts: []
        }
      },
      { new: true, upsert: true }
    );
    
    await Profile.findOneAndUpdate(
      { userId: new Types.ObjectId(userB) },
      {
        $set: {
          userId: new Types.ObjectId(userB),
          name: "Channel-User-B",
          dob: new Date("1990-01-01"),
          sex: "Male",
          address: "456 Test St",
          phone: "0987654321",
          email: "userb@example.com",
          medicalInfo: {
            condition: "None",
            drugs: "None",
            allergies: "None"
          },
          emergencyContacts: []
        }
      },
      { new: true, upsert: true }
    );
  
    // Ensure we have an existing channel between userA and userB
    const {
      body: { _id: testChannelId },
    } = await request(app)
      .post('/api/channels')
      .send({
        name: 'Test Channel For Phone Call',
        users: [userA, userB],
      })
      .expect(200)
  
    // Make the phone call request
    const { body: result } = await request(app)
      .post(`/api/channels/${testChannelId}/phone-call`)
      .set('x-application-uid', userA) // Sender is userA
      .expect(200)
  
    // Validate the response contains the expected phone call message
    expect(result.message.content).toBe(
      `Phone call started now between Channel-User-A and Channel-User-B.`
    )
    expect(result.message.sender.username).toBe('Channel-User-A')
    expect(result.message.channelId).toBe(testChannelId)
  
    // Validate the phone number returned is of userB (the receiver)
    expect(result.phoneNumber).toBe('0987654321')
  })


  afterAll(TestDatabase.close)
})
