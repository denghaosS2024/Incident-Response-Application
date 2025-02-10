import { Meta, StoryObj } from '@storybook/react'

import MessageList from '../components/MessageList'
import IMessage from '../models/Message'
import moment from 'moment'

const message1: IMessage = {
  _id: '66ac3bd3d3cdaf58f9a5a268',
  content: 'Hello',
  sender: {
    _id: '66ac3b73d3cdaf58f9a5a24f',
    username: 'ok',
    role: 'Citizen',
  },
  channelId: '66ac3b73d3cdaf58f9a5a252',
  timestamp: '2024-08-02T01:52:19.426Z',
}

const message2: IMessage = {
  _id: '66ac3ccbd3cdaf58f9a5a29e',
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
  sender: {
    _id: '66ac3c77d3cdaf58f9a5a281',
    username: 'ok1',
    role: 'Citizen',
  },
  channelId: '66ac3b73d3cdaf58f9a5a252',
  timestamp: '2024-08-29T17:26:45.636Z',
}

const message3: IMessage = {
  _id: '66ac3ccbd3cdaf58f9a5a29e',
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
  sender: {
    _id: '66ac3c77d3cdaf58f9a5a281',
    username: 'Test User',
    role: 'Citizen',
  },
  channelId: '66ac3b73d3cdaf58f9a5a252',
  timestamp: '2024-08-24T17:26:45.636Z',
}

const parseMessage: (rawMessage: IMessage) => IMessage = ({
  timestamp,
  ...rest
}: IMessage) => {
  return {
    timestamp: moment(timestamp).calendar(),
    ...rest,
  }
}

const message1Parsed = parseMessage(message1)
const message2Parsed = parseMessage(message2)
const message3Parsed = parseMessage(message3)

const meta: Meta = {
  title: 'Messages/MessageList',
  component: MessageList,
  parameters: {
    loading: false,
    messages: [message1Parsed, message2Parsed, message3Parsed],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    loading: false,
    messages: [message1Parsed, message2Parsed, message3Parsed],
  },
}

export const Empty: Story = { args: { messages: [], loading: false } }

export const Loading: Story = { args: { loading: true } }
