import { mock } from 'jest-mock-extended'
import SocketIO from 'socket.io'

import ChannelController from '../../src/controllers/ChannelController'
import UserController from '../../src/controllers/UserController'
import Channel, {
  IChannel,
  PUBLIC_CHANNEL_NAME,
} from '../../src/models/Channel'
import Message from '../../src/models/Message'
import { IUser } from '../../src/models/User'
import UserConnections from '../../src/utils/UserConnections'
import * as TestDatabase from '../utils/TestDatabase'
import { ROLES } from '../../src/utils/Roles'
import Profile, { IProfile } from '../../src/models/Profile'

jest.mock('@google-cloud/storage', () => {
  const mockGetSignedUrl = jest.fn().mockResolvedValue(['mock-signed-url'])
  const mockFile = jest.fn(() => ({ getSignedUrl: mockGetSignedUrl }))
  const mockBucket = jest.fn(() => ({ file: mockFile }))
  const mockStorage = jest.fn().mockImplementation(() => ({
    bucket: mockBucket,
  }))

  return { Storage: mockStorage }
})

describe('Channel controller', () => {
  // "System" user is created in the database upon app run so by default there always is one user present in the database.
  let userA: IUser
  let userB: IUser
  let userC: IUser
  let channel: IChannel
  let profileB: IProfile

  beforeAll(async () => {
    TestDatabase.connect()

    userA = await UserController.register('Channel-User-A', 'password-A')
    userB = await UserController.register('Channel-User-B', 'password-B')
    userC = await UserController.register('Channel-User-C', 'password-C')

    const profileData = {
      userId: userB._id,
      name: "Test User B",
      dob: new Date("1990-01-01"),
      sex: "Male" as "Male" | "Female" | "Other",
      address: "123 Test St, Test City",
      phone: "+11234567890",
      email: "userb@example.com",
      medicalInfo: {
        condition: "None",
        drugs: "None",
        allergies: "None"
      },
      emergencyContacts: []
    };
    
    // Create/update profile directly using findOneAndUpdate
    profileB = await Profile.findOneAndUpdate(
      { userId: userB._id }, 
      { $set: profileData }, 
      { new: true, upsert: true }
    ).exec();
  })

  it('will not allow to create the public channel manually', async () => {
    expect.assertions(1)

    try {
      await ChannelController.create({
        name: PUBLIC_CHANNEL_NAME,
        userIds: [],
      })
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe(
        'Channel name cannot be the public channel name',
      )
    }
  })

  it('will create a new channel given users and channel name', async () => {
    channel = await ChannelController.create({
      name: 'Test Channel',
      userIds: [userA._id, userB._id],
    })

    expect(channel.name).toBe('Test Channel')
    expect(channel.users.length).toBe(2)
    expect(channel.messages!.length).toBe(0)
  })

  // Due to schema change and adding mandatory name to channels, this test is redundant
  it.skip('will return the existing channel if users are essentially the same', async () => {
    const newChannel = await ChannelController.create({
      name: 'Test Channel',
      userIds: [userB._id, userA._id],
    })

    expect(newChannel.id).toEqual(channel.id)
  })

  it('can list all existing channels', async () => {
    const result = await ChannelController.list()

    expect(result.length).toBe(2)
    expect(result[0].name).toEqual('Public')
    expect(result[0].users.length).toBe(3)
    // hide messages when listing all channels
    expect(result[0].messages?.length).toBe(0)
    expect(result[1].name).toEqual('Test Channel')
    expect(result[1].users.length).toBe(2)
    expect(result[1].messages?.length).toBe(0)
  })

  it('can list channels which a user joined', async () => {
    const result = await ChannelController.list(userC._id)

    expect(result.length).toBe(1)
    expect(result[0].name).toEqual('Public')
  })

  it('can get a channel by id', async () => {
    const publicChannel = await Channel.getPublicChannel()
    const channel = await ChannelController.get(publicChannel._id)

    expect(channel!.name).toBe(PUBLIC_CHANNEL_NAME)
  })

  it('can post a new message to the channel and notify others', async () => {
    // setup connections
    const socketA = mock<SocketIO.Socket>()
    const socketB = mock<SocketIO.Socket>()

    UserConnections.addUserConnection(userA.id, socketA, ROLES.CITIZEN)
    UserConnections.addUserConnection(userB.id, socketB, ROLES.CITIZEN)

    // userA post a message to the public channel
    const publicChannel = await Channel.getPublicChannel()
    const content = 'here is a new message'
    const message = await ChannelController.appendMessage({
      content,
      senderId: userA._id,
      channelId: publicChannel._id,
      isAlert: false,
      responders: [],
    })

    expect(message.content).toBe(content)
    expect(message.sender._id).toEqual(userA._id)
    expect(message.channelId).toEqual(publicChannel._id)

    // verify that the message has been forwarded to others in the channel
    expect(socketB.emit).toHaveBeenCalledWith('new-message', message)
    expect(socketA.emit).not.toHaveBeenCalled()
  })

  it('can create channel without optional feilds', async () => {
    const newChannel = await ChannelController.create({
      name: 'Test Channel 2',
      userIds: [userA._id, userB._id],
    })

    expect(newChannel.name).toBe('Test Channel 2')
    expect(newChannel.users.length).toBe(2)
    expect(newChannel.messages?.length).toBe(0)
    expect(newChannel.closed).toBe(false)
    expect(newChannel.description).toBeUndefined()
  })

  it('can create channel with optional fields', async () => {
    const newChannel = await ChannelController.create({
      name: 'Test Channel 3',
      userIds: [userA._id, userB._id],
      description: 'This is a test channel',
      closed: true,
      ownerId: userB._id,
    })

    expect(newChannel.name).toBe('Test Channel 3')
    expect(newChannel.users.length).toBe(2)
    expect(newChannel.closed).toBe(true)
    expect(newChannel.description).toBe('This is a test channel')
    // const owner = JSON.parse(newChannel.owner.toString())
    const rawOwner = JSON.stringify(newChannel.owner)
    const owner = JSON.parse(rawOwner)
    expect(owner._id).toBe(userB._id.toString())
  })

  it('can delete a channel by name', async () => {
    // given
    const newChannel = await ChannelController.create({
      name: 'Test Channel 4',
      userIds: [userA._id, userB._id],
      closed: false,
      ownerId: userA._id,
    })
    expect(await ChannelController.get(newChannel._id)).toBeDefined()

    // when
    await ChannelController.delete(newChannel.name)

    // then
    expect(await ChannelController.get(newChannel._id)).toBeNull()
  })

  it('should not be able to delete the public channel', async () => {
    // given
    const publicChannel = await Channel.getPublicChannel()

    // when-then
    try {
      await ChannelController.delete(publicChannel.name)
    } catch (e) {
      const error = e as Error
      expect(error.message).toBe('Cannot delete the public channel')
    }
  })

  it('should return uploadUrl and fileUrl for an existing channel for video upload', async () => {
    // Create a channel in the DB
    const testChannel = await ChannelController.create({
      name: 'Test Channel For Upload',
      userIds: [userA._id],
    })

    // Call getVideoUploadUrl
    const { uploadUrl, fileUrl } = await ChannelController.getVideoUploadUrl(
      testChannel._id
    )

    // Assert that the values match mock
    expect(uploadUrl).toBe('mock-signed-url')
    expect(fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//)
  })

  it('should return uploadUrl and fileUrl for an existing channel for image upload', async () => {
    // Create a channel in the DB
    const testChannel = await ChannelController.create({
      name: 'Test Channel For Image Upload',
      userIds: [userA._id],
    });
  
    // Call getImageUploadUrl
    const { uploadUrl, fileUrl } = await ChannelController.getImageUploadUrl(testChannel._id);
  
    // Assert that the values match mock
    expect(uploadUrl).toBe('mock-signed-url');
    expect(fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//);
    expect(fileUrl).toContain('.png');
  });

  it('should return uploadUrl and fileUrl for an existing channel for file upload', async () => {
    // Create a channel in the DB
    const testChannel = await ChannelController.create({
      name: 'Test Channel For Upload File',
      userIds: [userA._id],
    })

    // Call getFileUploadUrl
    const { uploadUrl, fileUrl } = await ChannelController.getFileUploadUrl(
      testChannel._id,"file","application/pdf",".pdf")

    // Assert that the values match mock
    expect(uploadUrl).toBe('mock-signed-url')
    expect(fileUrl).toMatch(/^https:\/\/storage\.googleapis\.com\//)
    expect(fileUrl).toContain(".pdf")
    expect(fileUrl).toContain("file")
  })

  it('should handle error if GCS getSignedUrl call fails for video upload', async () => {
    // Create a channel in the DB (so the error is from the GCS layer, not from "channel not found")
    const testChannel = await ChannelController.create({
      name: 'Channel GCS Error',
      userIds: [userA._id],
    })

    // Force the mock to throw an error on getSignedUrl
    const { Storage } = require('@google-cloud/storage')
    Storage.mockImplementation(() => ({
      bucket: () => ({
        file: () => ({
          getSignedUrl: jest.fn().mockRejectedValue(new Error('GCS Error')),
        }),
      }),
    }))
    
    const result = await ChannelController.getVideoUploadUrl(testChannel._id)
    expect(result).toEqual({ error: 'Error generating signed URL' })
  })

  it('should handle error if GCS getSignedUrl call fails for image upload', async () => {
    // Create a channel in the DB
    const testChannel = await ChannelController.create({
      name: 'test',
      userIds: [userA._id],
    });
  
    // Force the mock to throw an error on getSignedUrl
    const { Storage } = require('@google-cloud/storage');
    Storage.mockImplementation(() => ({
      bucket: () => ({
        file: () => ({
          getSignedUrl: jest.fn().mockRejectedValue(new Error('GCS Error')),
        }),
      }),
    }));
  
    // Expect function to return an error object instead of throwing an error
    const result = await ChannelController.getImageUploadUrl(testChannel._id);
    expect(result).toEqual({ error: 'Error generating signed URL' });
  });

  it('can acknowledge a message and notify other users', async () => {
    // Create a channel with both users
    const channel = await ChannelController.create({
      name: 'Channel to Acknowledge',
      userIds: [userA._id, userB._id],
    })

    // Create (or append) a new message in that channel from userA
    const newMessage = await Message.create({
      content: 'This is a test alert',
      channelId: channel._id,
      sender: userA._id,
    })

    // "Connect" userB’s socket so it can receive "acknowledge-alert"
    const socketB = mock<SocketIO.Socket>()
    UserConnections.addUserConnection(userB.id, socketB, ROLES.CITIZEN)

    // userA calls acknowledgeMessage on that message
    const acknowledged = await ChannelController.acknowledgeMessage(
      newMessage._id,
      userA._id,
      channel._id
    )

    // Confirm the message in the DB was updated
    expect(acknowledged.acknowledgedBy.length).toBe(1)
    expect(acknowledged.acknowledgedBy[0]._id.toHexString()).toBe(userA._id.toHexString())
    // Check that there's an acknowledgedAt
    expect(acknowledged.acknowledgedAt).toBeDefined()
    expect(socketB.emit).toHaveBeenCalledWith('acknowledge-alert', expect.any(Object))
  })

  it('should make a phone call between two users and notify the other user', async () => {
    // Mock socket connections for notifications
    const socketA = mock<SocketIO.Socket>();
    const socketB = mock<SocketIO.Socket>();
  
    UserConnections.addUserConnection(userA.id, socketA, ROLES.CITIZEN);
    UserConnections.addUserConnection(userB.id, socketB, ROLES.CITIZEN);
  
    // Create a direct message channel between userA and userB
    const privateChannel = await ChannelController.create({
      name: 'Private Channel',
      userIds: [userA._id, userB._id],
    });
  
    const result = await ChannelController.makePhoneCall(privateChannel._id, userA._id);
  
    expect(result.message.content).toBe(`Phone call started now between ${userA.username} and ${userB.username}.`);
    expect(result.message.sender._id).toEqual(userA._id);
    expect(result.message.channelId).toEqual(privateChannel._id);
    expect(result.phoneNumber).toBe(profileB.phone);
  
    expect(socketB.emit).toHaveBeenCalledWith('new-message', result.message);
  })

  afterAll(TestDatabase.close)
})

