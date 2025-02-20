import { Meta, StoryObj } from '@storybook/react'
import { UserBadge, UserBadgeProps } from '../../components/common/UserBadge'

const meta = {
  title: 'Material UI/UserBadge',
  component: UserBadge,
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: { type: 'select' },
      options: ['dispatcher', 'firefighter', 'police', 'nurse'],
      description: 'User role to determine the badge',
    },
  },
} satisfies Meta<UserBadgeProps>

export default meta
type Story = StoryObj<typeof meta>

export const Dispatcher: Story = {
  args: {
    role: 'dispatcher',
  },
}

export const Firefighter: Story = {
  args: {
    role: 'firefighter',
  },
}

export const Police: Story = {
  args: {
    role: 'police',
  },
}

export const Nurse: Story = {
  args: {
    role: 'nurse',
  },
}
