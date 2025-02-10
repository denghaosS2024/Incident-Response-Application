import { Meta, StoryObj } from '@storybook/react'

import ChannelList from '../components/ChannelList'

const meta = {
  title: 'Messages/ChannelList',
  component: ChannelList,
  parameters: {
    channels: [],
    loading: false,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChannelList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    channels: [
      {
        _id: 'id-1',
        name: 'Public',
        users: [],
      },
      {
        _id: 'id-2',
        name: 'UserB',
        users: [],
      },
    ],
    loading: false,
  },
}

export const Loading: Story = { args: { loading: true } }
