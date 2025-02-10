import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import ContactList from '../components/ContactList'

const meta = {
  title: 'Contacts/ContactList',
  component: ContactList,
  parameters: {
    users: [],
    onClick: action('chat with'),
    loading: false,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContactList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    users: [
      {
        _id: 'id-A',
        username: 'UserA',
        role: 'Citizen',
        online: true,
      },
      {
        _id: 'id-B',
        username: 'UserB',
        role: 'Police',
        online: false,
      },
    ],
    onClick: action('chat with'),
    loading: false,
  },
}

export const Loading: Story = { args: { loading: true } }

export const NoUsers: Story = { args: { users: [], loading: false } }
