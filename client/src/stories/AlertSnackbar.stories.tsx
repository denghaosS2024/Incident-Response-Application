import { Meta, StoryObj } from '@storybook/react'
import AlertSnackbar from '../components/common/AlertSnackbar'
import { Box } from '@mui/material'

const meta = {
  title: 'Common/AlertSnackbar',
  component: AlertSnackbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ minHeight: '100px', padding: 2 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AlertSnackbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    message: 'This is a default error message!',
    severity: 'error',
    onClose: () => console.log('Snackbar closed'),
  },
}

export const SuccessMessage: Story = {
  args: {
    open: true,
    message: 'Operation completed successfully!',
    severity: 'success',
    onClose: () => console.log('Snackbar closed'),
    vertical: 'top',
    horizontal: 'center',
  },
}

export const WarningMessage: Story = {
  args: {
    open: true,
    message: 'This is a warning message!',
    severity: 'warning',
    onClose: () => console.log('Snackbar closed'),
    vertical: 'bottom',
    horizontal: 'right',
  },
}

export const InfoMessage: Story = {
  args: {
    open: true,
    message: 'Here is some information for you.',
    severity: 'info',
    onClose: () => console.log('Snackbar closed'),
    vertical: 'top',
    horizontal: 'left',
  },
}

export const CustomDuration: Story = {
  args: {
    open: true,
    message: 'This message will disappear after 10 seconds.',
    severity: 'info',
    onClose: () => console.log('Snackbar closed'),
    autoHideDuration: 10000, // 10 seconds duration
  },
}
