import { Meta, StoryObj } from '@storybook/react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Card from '../components/Card'

const meta = {
  title: 'Groups/Card',
  component: Card,
  tags: ['autodocs'], // Enable autodocs
  parameters: {
    docs: {
      description: {
        component:
          'This component represents a user card within a group. It supports drag-and-drop functionality.',
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    task: {
      _id: '67ca7557da683a25ed90e364',
      username: 'John Doe',
      role: 'user',
    },
    index: 0,
  },
  render: (args) => (
    <DragDropContext
      onDragEnd={(result) => {
        console.log(result)
      }}
    >
      <Droppable droppableId="droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Card {...args} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ),
}
