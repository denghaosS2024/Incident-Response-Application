import { Button } from '@mui/material'
import { DecoratorFn, Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import ConfirmationDialog from '../components/common/ConfirmationDialog'

const meta = {
  title: 'Common/ConfirmationDialog',
  component: ConfirmationDialog,
  tags: ['autodocs'],
  argTypes: {
    onConfirm: { action: 'confirmed' },
    onCancel: { action: 'canceled' },
  },
} satisfies Meta<typeof ConfirmationDialog>

export default meta
type Story = StoryObj<typeof meta>

// Create a decorator to manage the dialog's state and provide the open/close logic
const DialogDecorator: DecoratorFn = (Story, context) => {
  const [open, setOpen] = useState(context.args.open)

  const handleCancel = () => {
    setOpen(false)
    context.args.onCancel?.()
  }

  const handleConfirm = () => {
    setOpen(false)
    context.args.onConfirm?.()
  }

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Story
        args={{
          ...context.args,
          open,
          onCancel: handleCancel,
          onConfirm: handleConfirm,
        }}
      />
    </>
  )
}

export const Default: Story = {
  args: {
    open: false,
    title: 'Confirm Deletion',
    description: 'Are you sure you want to delete this item?',
    confirmText: 'Yes, Delete',
    cancelText: 'Cancel',
  },
  decorators: [DialogDecorator],
}

export const WithCustomTexts: Story = {
  args: {
    open: false,
    title: 'Save Changes',
    description: 'Do you want to save the changes you made?',
    confirmText: 'Save',
    cancelText: "Don't Save",
  },
  decorators: [DialogDecorator],
}

export const InfoDialog: Story = {
  args: {
    open: false,
    title: 'Information',
    description:
      'This is an informational dialog with only a confirmation button.',
    confirmText: 'Got It',
    onCancel: undefined,
  },
  decorators: [DialogDecorator],
}

export const CustomAction: Story = {
  args: {
    open: false,
    title: 'Custom Action',
    description: 'Would you like to proceed with this custom action?',
    confirmText: 'Proceed',
    cancelText: 'Abort',
  },
  decorators: [DialogDecorator],
}
