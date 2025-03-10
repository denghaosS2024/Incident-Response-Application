import { Meta, StoryObj } from '@storybook/react'

import FilePreview from '../components/FilePreview'

const meta = {
    title: 'File/FilePreview',
    component: FilePreview,
    tags: ['autodocs'],
  } satisfies Meta<typeof FilePreview>
  
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
      filename:"file",
      size:512,
    },
}