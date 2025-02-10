import * as TestDatabase from '../utils/TestDatabase'
import Channel, { PUBLIC_CHANNEL_NAME } from '../../src/models/Channel'

describe('Channel model', () => {
  beforeAll(TestDatabase.connect)

  it('will create the public channel since it does not exist', async () => {
    // prove that there is no channel
    expect(await Channel.find().exec()).toEqual([])

    const publicChannel = await Channel.getPublicChannel()
    const channels = await Channel.find().exec()

    expect(channels.length).toBe(1)
    expect(channels[0].id).toBe(publicChannel.id)
    expect(publicChannel.name).toBe(PUBLIC_CHANNEL_NAME)
  })

  it('will return the existing public channel', async () => {
    const channels = await Channel.find().exec()

    // prove that there is already a public channel
    expect(channels.length).toBe(1)

    const publicChannel = await Channel.getPublicChannel()

    // prove that no new channels are created
    expect(await Channel.find().exec()).toStrictEqual(channels)
    expect(channels[0].id).toBe(publicChannel.id)
  })

  afterAll(TestDatabase.close)
})
