import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import StarRating from '../components/common/StarRating'

const meta: Meta<typeof StarRating> = {
  title: 'Common/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'number', min: 0, max: 5, step: 1 },
    },
    label: {
      control: 'text',
    },
    icon: {
      control: 'text',
    },
  },
}
export default meta

type Story = StoryObj<typeof StarRating>

export const Interactive: Story = {
  render: (args) => {
    const [rating, setRating] = useState(args.rating || 3)
    return <StarRating {...args} rating={rating} onChange={setRating} />
  },
  args: {
    label: 'Rate this experience:',
    rating: 3,
  },
}

export const ReadOnly: Story = {
  render: (args) => <StarRating {...args} />,
  args: {
    label: 'Read-only rating:',
    rating: 4,
    onChange: undefined, // no click
  },
}

export const WithIcon: Story = {
  render: (args) => {
    const [rating, setRating] = useState(args.rating || 2)
    return <StarRating {...args} rating={rating} onChange={setRating} />
  },
  args: {
    label: 'With Role Icon',
    rating: 2,
    icon: '🔥',
  },
}
