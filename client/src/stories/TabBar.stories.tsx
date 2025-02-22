import { Meta, StoryObj } from '@storybook/react'

import { Home, Message, PermContactCalendar } from '@mui/icons-material'
import Groups2Icon from '@mui/icons-material/Groups2'
import TabBar from '../components/TabBar'

const meta: Meta = {
  title: 'Common/TabBar',
  component: TabBar,
  parameters: {
    links: [],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    links: [
      { prefix: '/', key: 'home', icon: <Home />, to: '#' },
      { prefix: '/messages', key: 'msg', icon: <Message />, to: '#' },
      {
        prefix: '/contacts',
        key: 'contacts',
        icon: <PermContactCalendar />,
        to: '#',
      },
      { prefix: '/groups', key: 'groups', icon: <Groups2Icon />, to: '#' },
    ],
  },
}

export const UnreadMessage: Story = {
  args: {
    links: [
      { prefix: '/', key: 'home', icon: <Home />, to: '#' },
      {
        prefix: '/messages',
        key: 'msg',
        icon: <Message style={{ color: 'red' }} />,
        to: '#',
      },
      {
        prefix: '/contacts',
        key: 'contacts',
        icon: <PermContactCalendar />,
        to: '#',
      },
      { prefix: '/groups', key: 'groups', icon: <Groups2Icon />, to: '#' },
    ],
  },
}
