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

const roleTitles: Record<string, string> = {
  Citizen: 'IR Citizen',
  Dispatch: 'IR Dispatch',
  Police: 'IR Police',
  Fire: 'IR Fire',
  Nurse: 'IR Nurse',
}

const generateRoleStory = (role: string): Story => ({
  args: {
    showBackButton: true,
    showMenu: true,
  },
  parameters: {
    role,
    title: roleTitles[role] || 'IR Citizen',
  },
})

export const Default: Story = {}

export const WithBackButton: Story = {
  args: { showBackButton: true },
}

export const WithMenuButton: Story = {
  args: { showMenu: true },
}

export const CitizenView = generateRoleStory('Citizen')
export const DispatchView = generateRoleStory('Dispatch')
export const PoliceView = generateRoleStory('Police')
export const FireView = generateRoleStory('Fire')
export const NurseView = generateRoleStory('Nurse')
