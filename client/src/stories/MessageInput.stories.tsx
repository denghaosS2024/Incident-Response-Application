import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import MessageInput from '../components/MessageInput'

const meta = {
  title: 'Messages/MessageInput',
  component: MessageInput,
  parameters: {
    onSubmit: action('submit'),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
