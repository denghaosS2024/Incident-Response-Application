import { Meta, StoryObj } from '@storybook/react'

import Message from '../components/Message'

const meta: Meta = {
  title: 'Messages/Message',
  component: Message,
  tags: ['autodocs'],
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: {
      sender: { username: 'John Doe' },
      timestamp: '10 minutes ago',
      content: 'Hello, world!',
    },
  },
}

export const Alert: Story = {
  args: {
    message: {
      sender: { username: 'John Doe' },
      timestamp: '10 minutes ago',
      isAlert: true,
      content: 'ALL CLEAR-#00e6e6-black',
    },
  },
}

export const VideoMessage: Story = {
  args: {
    message: {
      sender: { username: 'Jane Doe' },
      timestamp: '5 minutes ago',
      content: 'https://storage.googleapis.com/sem-video-bucket/videos/sample-video.webm',
    },
  },
}

export const FileMessage: Story = {
  args: {
    message: {
      sender: { username: 'Jane Doe' },
      timestamp: '5 minutes ago',
      content: 'https://storage.googleapis.com/sem-video-bucket/uploads/file.pdf',
    },
  },
}

export const AudioMessage: Story = {
  args: {
    message: { 
      sender: { username: 'Jane Doe' },
      timestamp: '5 minutes ago',
      content: 'https://storage.googleapis.com/sem-video-bucket/uploads/sample-voice.webcam',
    },
  },
}

export const AcknowledgeAlertVariant: Story = {
  args: {
    message: {
      sender: {
        _id: 'user123', 
        username: 'Commander',
        role: 'admin',
      },
      timestamp: '2 minutes ago',
      isAlert: true,
      content: 'Emergency Alert-#FF0000-#FFFFFF', 
      responders: [
        { _id: 'userA', username: 'Alice' },
        { _id: 'userB', username: 'Bob' },
        { _id: 'userC', username: 'Charlie' },
      ],
      acknowledgedBy: [
        { _id: 'userA', username: 'Alice' },
        { _id: 'userB', username: 'Bob' },
      ],
      acknowledgedAt: [
        '2024-03-09T10:00:00Z',
        '2024-03-09T10:05:00Z',
      ],
    },
    allAcknowledged: false, // Default: Not all users acknowledged
  },
  argTypes: {
    allAcknowledged: {
      control: 'boolean', // Adds a toggle in Storybook
      description: 'Toggle between partial and full acknowledgment',
    },
  },
  decorators: [
    (Story, context) => {
      const { allAcknowledged } = context.args;
      
      // Create a deep copy of the message object to avoid mutating the original
      const updatedMessage = JSON.parse(JSON.stringify(context.initialArgs.message));

      // Modify the deep copy instead of the original
      if (allAcknowledged) {
        updatedMessage.acknowledgedBy = [...updatedMessage.responders];
        updatedMessage.acknowledgedAt = [
          '2024-03-09T10:00:00Z',
          '2024-03-09T10:05:00Z',
          '2024-03-09T10:10:00Z',
        ];
      } else {
        // Restore to the initial (partial acknowledgment) state
        updatedMessage.acknowledgedBy = [
          { _id: 'userA', username: 'Alice' },
          { _id: 'userB', username: 'Bob' },
        ];
        updatedMessage.acknowledgedAt = [
          '2024-03-09T10:00:00Z',
          '2024-03-09T10:05:00Z',
        ];
      }

      context.args.message = updatedMessage;

      localStorage.setItem('uid', 'user123'); // Ensure user is the sender
      return <Story />;
    },
  ],
};
