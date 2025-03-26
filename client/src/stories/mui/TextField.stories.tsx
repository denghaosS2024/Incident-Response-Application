import { TextField, TextFieldProps } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Material UI/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Variant of the TextField',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'warning', 'info'],
      description: 'Color of the TextField',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Size of the TextField',
    },
    fullWidth: {
      control: 'boolean',
      description:
        'Should the TextField take up the full width of the container',
    },
    disabled: {
      control: 'boolean',
      description: 'Is the TextField disabled',
    },
    label: {
      control: 'text',
      description: 'Label for the TextField',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the TextField',
    },
    type: {
      control: 'text',
      description:
        'Type of the TextField. It should be valud HTML input type (text, password, email, etc.)',
    },
  },
} satisfies Meta<TextFieldProps>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultTextField: Story = {
  args: {
    variant: 'outlined',
    color: 'primary',
    size: 'medium',
    label: 'Default',
    placeholder: 'Enter text...',
  },
}

export const UsernameWithErrorField: Story = {
  args: {
    variant: 'outlined',
    label: 'Username',
    fullWidth: true,
    error: true,
    helperText: 'Username can not be empty',
  },
}

export const PasswordField: Story = {
  args: {
    variant: 'outlined',
    label: 'Password',
    fullWidth: true,
    type: 'password',
  },
}
