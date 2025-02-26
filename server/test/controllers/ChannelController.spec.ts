import { mock } from 'jest-mock-extended'
import SocketIO from 'socket.io'

import ChannelController from '../../src/controllers/ChannelController'
import UserController from '../../src/controllers/UserController'
import Channel, {
  IChannel,
  PUBLIC_CHANNEL_NAME,
} from '../../src/models/Channel'
import { IUser } from '../../src/models/User'
import UserConnections from '../../src/utils/UserConnections'
import * as TestDatabase from '../utils/TestDatabase'

describe('Channel controller', () => {
  let userA: IUser
  let userB: IUser
  let userC: IUser
  let channel: IChannel

  beforeAll(async () => {
    TestDatabase.connect()

    userA = await UserController.register('Channel-User-A', 'password-A')
    userB = await UserController.register('Channel-User-B', 'password-B')
    userC = await UserController.register('Channel-User-C', 'password-C')
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

    UserConnections.addUserConnection(userA.id, socketA)
    UserConnections.addUserConnection(userB.id, socketB)

    // userA post a message to the public channel
    const publicChannel = await Channel.getPublicChannel()
    const content = 'here is a new message'
    const message = await ChannelController.appendMessage({
      content,
      senderId: userA._id,
      channelId: publicChannel._id,
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

  afterAll(TestDatabase.close)
})
