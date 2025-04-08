import { configureStore } from "@reduxjs/toolkit";
import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import ChatBox from "../components/Chat/ChatBox";
import type IMessage from "../models/Message";
import type IUser from "../models/User";

// Create a mock store
const mockStore = configureStore({
  reducer: {
    // Add any required reducers here
    messageState: (state = { messages: {} }) => state,
    // Add other reducers as needed
  },
});

const meta: Meta<typeof ChatBox> = {
  title: "Chat/ChatBox",
  component: ChatBox,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatBox>;

const mockUsers: { [key: string]: IUser } = {
  user1: {
    _id: "user1",
    username: "John Doe",
    role: "Citizen",
    online: true,
  },
  user2: {
    _id: "user2",
    username: "Dispatcher",
    role: "Dispatch",
    online: true,
  },
};

const mockMessages: IMessage[] = [
  {
    _id: "1",
    content: "Hello, this is a test message",
    sender: mockUsers.user1,
    timestamp: new Date("2024-03-07T10:00:00").toString(),
    channelId: "channel1",
    isAlert: false,
  },
  {
    _id: "2",
    content: "This is a response",
    sender: mockUsers.user2,
    timestamp: new Date("2024-03-07T10:01:00").toString(),
    channelId: "channel1",
    isAlert: false,
  },
];

export const Default: Story = {
  args: {
    channelId: "channel1",
    messages: mockMessages,
    currentUserId: "user1",
    currentUserRole: "Citizen",
    isLoading: false,
    onSendMessage: async (content: string, channelId: string) => {
      console.log("Message sent:", content, "to channel:", channelId);
    },
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
    messages: [],
  },
};

export const EmptyChat: Story = {
  args: {
    ...Default.args,
    messages: [],
  },
};

export const FirefighterView: Story = {
  args: {
    ...Default.args,
    currentUserRole: "Fire",
  },
};

export const PoliceView: Story = {
  args: {
    ...Default.args,
    currentUserRole: "Police",
  },
};
