import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import AddIcon from '@mui/icons-material/Add'
import AddGroup from '../components/AddGroup'

const meta = {
  title: 'Groups/AddGroup',
  component: AddGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof AddGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tabs: [
      {
        text: '',
        link: '/groups',
        icon: <AddIcon />,
      },
    ],
    onClick: action('onClick'),
  },
}

