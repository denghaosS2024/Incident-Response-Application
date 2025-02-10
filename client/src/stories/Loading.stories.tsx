import { Meta, StoryObj } from '@storybook/react'
import Loading from '../components/common/Loading'

const meta = {
  title: 'Common/Loading',
  component: Loading,
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
