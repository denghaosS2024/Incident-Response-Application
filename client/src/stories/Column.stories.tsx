import { ComponentMeta, ComponentStory } from '@storybook/react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import Column from '../components/Column'
import IUser from '../models/User'

interface ColumnArgs {
  title: string
  id: string
  tasks: IUser[]
  groups?: { _id: string; name: string }[]
  onGroupClick?: (groupId: string) => void
}

export default {
  title: 'Groups/Column',
  component: Column,
  argTypes: {
    onGroupClick: { action: 'onGroupClick' },
  },
  tags: ['autodocs'], // Enable autodocs
  parameters: {
    docs: {
      description: {
        component:
          'The `Column` component represents a draggable column containing tasks or users. It supports drag-and-drop functionality through `react-beautiful-dnd`. You can also associate users with groups and click on a group to perform specific actions.',
      },
    },
  },
} as ComponentMeta<typeof Column>

const handleDragEnd = (result: DropResult) => {
  console.log('Drag ended:', result)
}

const Template: ComponentStory<typeof Column> = (args: ColumnArgs) => {
  console.log('Storybook Args:', args)
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Column {...args} />
    </DragDropContext>
  )
}

export const Default = Template.bind({})
Default.args = {
  title: 'Drag and Drop Participants',
  id: '67ca7557da683a25ed90e364',
  tasks: [
    { _id: '67ca7557da683a25ed90e365', username: 'User 1', role: 'user' },
    { _id: '67ca7557da683a25ed90e366', username: 'User 2', role: 'admin' },
  ],
  groups: [
    { _id: '67ca7557da683a25ed90e367', name: 'Group A' },
    { _id: '67ca7557da683a25ed90e368', name: 'Group B' },
  ],
  onGroupClick: (groupId: string) => console.log(`Group clicked: ${groupId}`),
}
