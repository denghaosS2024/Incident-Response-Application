import { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'react-redux'
import Board from '../components/Board'
import { store } from '../redux/store'

export default {
  title: 'Groups/BoardDnd',
  component: Board,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The `Board` component represents a draggable board where users can be added to different groups. It allows setting the group name, description, and users through controlled state, making it suitable for drag-and-drop functionality with Redux integration.',
      },
    },
  },
} as Meta<typeof Board>

type Story = StoryObj<typeof Board>

export const Default: Story = {
  args: {
    setUsers: (users: string[]) => {
      console.log('Selected users:', users)
    },
  },
}
