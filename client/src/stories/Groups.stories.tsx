import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import AddIcon from '@mui/icons-material/Add'
import {
  Divider,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

const AddGroup = () => (
  <>
    <Link color="inherit">
      <ListItem button>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary="Add Group" />
      </ListItem>
    </Link>
    <Divider />
  </>
)

const meta = {
  title: 'Groups/AddGroup',
  component: AddGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof AddGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClick: action('onClick'),
    'aria-label': 'Add Group',
  },
}
