import { Meta, StoryObj } from '@storybook/react'
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { PermContactCalendar as Contact, Message } from '@mui/icons-material'

const meta: Meta = {
  title: 'Material UI/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    dense: {
      control: 'boolean',
      description:
        'If true, compact vertical padding will be applied to the list items.',
    },
    disablePadding: {
      control: 'boolean',
      description:
        'If true, the left and right padding is removed from the list.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const items = [
  {
    text: 'Messages',
    icon: <Message />,
  },
  {
    text: 'Contacts',
    icon: <Contact />,
  },
]

export const DefaultList: Story = {
  args: {
    dense: false,
    disablePadding: false,
  },
  render: (args) => (
    <List {...args}>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  ),
}

export const DenseList: Story = {
  args: {
    dense: true,
    disablePadding: false,
  },
  render: (args) => (
    <List {...args}>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  ),
}

export const NoPaddingList: Story = {
  args: {
    dense: false,
    disablePadding: true,
  },
  render: (args) => (
    <List {...args}>
      {items.map((item, index) => (
        <ListItem key={index}>
          <ListItemText primary={item.text} />
          <ListItemIcon>{item.icon}</ListItemIcon>
        </ListItem>
      ))}
    </List>
  ),
}
