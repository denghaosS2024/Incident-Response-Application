import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import NavigationBar from '../components/NavigationBar'

const meta = {
  title: 'Common/NavigationBar',
  component: NavigationBar,
  parameters: {
    showBackButton: false,
    onBack: action('back'),
    showMenu: false,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithBackButton: Story = { args: { showBackButton: true } }

export const WithMenuButton: Story = { args: { showMenu: true } }
