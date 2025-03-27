import {
    Link,
    Typography
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type { Meta, StoryObj } from '@storybook/react'
import GenericItemizeContainer, { GenericItemizeContainerProps } from '../components/GenericItemizeContainer'

const theme = createTheme()

const meta: Meta<typeof GenericItemizeContainer> = {
  title: 'Components/GenericItemizeContainer',
  component: GenericItemizeContainer,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default meta

// type Story = StoryObj<typeof GenericItemizeContainer>

// Sample data interface
interface User {
  id: number
  name: string
  email: string
  role: string
}

// Sample data
const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
]

export const WithTitleAndListItems: StoryObj<GenericItemizeContainerProps<User>> = {
  args: {
    title: 'User List',
    items: users,
    getKey: (item) => item.id.toString(),
    columns: [
      { 
        key: 'name', 
        label: 'Name', 
        align: 'left',
      },
      { 
        key: 'email', 
        label: 'Email', 
        align: 'left', 
      },
      { 
        key: 'role', 
        label: 'Role', 
        align: 'left', 
      },
    ],
    showHeader: false,
  },
}

export const WithHeaderLabelsAndCustomRendering: StoryObj<GenericItemizeContainerProps<User>>  = {
  args: {
    items: users,
    getKey: (item) => item.id.toString(),
    columns: [
      { 
        key: 'name', 
        label: 'Full Name', 
        render: (item) => (
            <Typography variant="body2" fontWeight="bold">
            {item.name}
          </Typography>
        ),
        align: 'center',
      },
      { 
        key: 'email', 
        label: 'Contact Email', 
        render: (item) => (
          <Link 
            href={`mailto:${item.email}`} 
            underline="hover" 
            color="primary"
        >
            {item.email}
        </Link>
        ),
        align: 'center',
      },
      { 
        key: 'role', 
        label: 'User Role', 
        render: (item) => (
            <Typography variant="body2" >
            {item.role}
          </Typography>
        ),
        align: 'center',
      },
    ],
  },
}

export const EmptyState: StoryObj<GenericItemizeContainerProps<User>>  = {
  args: {
    title: 'Empty User List',
    items: [],
    getKey: (item) => item.id.toString(),
    columns: [
        { 
          key: 'name', 
          label: 'Name', 
          align: 'left',
        },
        { 
          key: 'email', 
          label: 'Email', 
          align: 'left', 
        },
        { 
          key: 'role', 
          label: 'Role', 
          align: 'left', 
        },
      ],
    emptyMessage: 'No users found',
  },
}

export const LoadingState: StoryObj<GenericItemizeContainerProps<User>>  = {
  args: {
    title: 'User List',
    loading: true,
    getKey: (item) => item.id.toString(),
    columns: [
      { 
        key: 'name', 
        label: 'Name', 
        align: 'left',
      },
      { 
        key: 'email', 
        label: 'Email', 
        align: 'left', 
      },
      { 
        key: 'role', 
        label: 'Role', 
        align: 'left', 
      },
    ],
  },
}