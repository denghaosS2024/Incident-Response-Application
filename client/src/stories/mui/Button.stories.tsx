import { Button, ButtonProps } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Material UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'success', 'warning', 'info'],
      description: 'Color of the button',
    },
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
      description: 'Variant of the button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Should the button take up the full width of the container',
    },
    disabled: {
      control: 'boolean',
      description: 'Is the button disabled',
    },
  },
} satisfies Meta<ButtonProps>

export default meta
type Story = StoryObj<typeof meta>

export const LoginButton: Story = {
  args: {
    color: 'primary',
    variant: 'contained',
    children: 'Login',
  },
}

export const RegisterButton: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    children: 'Register',
  },
}

export const RegisterLinkButton: Story = {
  args: {
    variant: 'text',
    color: 'primary',
    children: 'Register',
  },
}
