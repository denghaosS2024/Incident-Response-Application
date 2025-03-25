import Channel from '../../src/models/Channel'
import SystemGroupConfigs from '../../src/utils/SystemDefinedGroups'
import * as TestDatabase from '../utils/TestDatabase'

describe('Channel model', () => {
  jest.setTimeout(10000)
  beforeAll(TestDatabase.connect)

  it('will get all system defined groups', async () => {
    const channels = await Channel.find().exec()
    expect(channels.length).toBe(SystemGroupConfigs.length)

    //Sort both arrays by name because of bad insertion order
    channels.sort((a, b) => a.name.localeCompare(b.name))
    SystemGroupConfigs.sort((a, b) => a.name.localeCompare(b.name))

    for (let i = 0; i < channels.length; i++) {
      expect(channels[i].name).toBe(SystemGroupConfigs[i].name)
      expect(channels[i].description).toBe(SystemGroupConfigs[i].description)
    }
  })

  describe('getPublicChannel', () => {
    it('Public channel is created automatically so that getPublicChannel should not implicity create one', async () => {
      const channels = await Channel.find().exec()

      // Get the public channel, this can create another channel if it doesn't exist
      // Which we do not want
      await Channel.getPublicChannel()

      // prove that no new channels are created
      const updatedList = await Channel.find().exec()

      // Sort both arrays by name because of bad insertion order
      updatedList.sort((a, b) => a.name.localeCompare(b.name))
      channels.sort((a, b) => a.name.localeCompare(b.name))

      expect(updatedList).toStrictEqual(channels)
      // expect(updatedList[0].id).toBe(publicChannel.id)
    })

    it('will create a new public channel if it does not exist', async () => {
      await Channel.deleteMany({ name: 'Public' }).exec()
      const channelsBefore = await Channel.find().exec()
      const publicChannel = await Channel.getPublicChannel()
      const channelsAfter = await Channel.find().exec()
      expect(channelsAfter.length).toBe(channelsBefore.length + 1)
      expect(publicChannel.name).toBe('Public')
    })
  })

  afterAll(TestDatabase.close)
})
