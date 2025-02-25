import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import AddIcon from '@mui/icons-material/Add'

const meta = {
  title: 'Groups/AddGroup',
  component: AddIcon,
  tags: ['autodocs'],
} satisfies Meta<typeof AddIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClick: action('onClick'),
    'aria-label': 'Add Group',
  },
}
