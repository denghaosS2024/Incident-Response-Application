import { Meta, StoryObj } from '@storybook/react'

import Message from '../components/Message'

const meta: Meta = {
  title: 'Messages/Message',
  component: Message,
  tags: ['autodocs'],
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: {
      sender: { username: 'John Doe' },
      timestamp: '10 minutes ago',
      content: 'Hello, world!',
    },
  },
}
