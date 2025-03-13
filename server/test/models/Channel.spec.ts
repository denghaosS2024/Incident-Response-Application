import Channel from '../../src/models/Channel'
import * as TestDatabase from '../utils/TestDatabase'
import SystemGroupConfigs from "../../src/utils/SystemDefinedGroups";

describe('Channel model', () => {
  jest.setTimeout(10000)
  beforeAll(TestDatabase.connect)

  it('will get all system defined groups', async () => {
    const channels = await Channel.find().exec()
    expect(channels.length).toBe(SystemGroupConfigs.length)
    for (let i = 0; i < channels.length; i++) {
      expect(channels[i].name).toBe(SystemGroupConfigs[i].name)
      expect(channels[i].description).toBe(SystemGroupConfigs[i].description)
    }
  })

  it('will return the existing public channel', async () => {
    const channels = await Channel.find().exec()
    const publicChannel = await Channel.getPublicChannel()

    // prove that no new channels are created
    expect(await Channel.find().exec()).toStrictEqual(channels)
    expect(channels[0].id).toBe(publicChannel.id)
  })

  afterAll(TestDatabase.close)
})
