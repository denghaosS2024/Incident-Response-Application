import { Meta, StoryObj, StoryFn } from "@storybook/react";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AlertPanel from "../components/AlertPanel";

// Create a mock store with a simple reducer
const mockStore = configureStore({
  reducer: {
    messageState: (state = { messages: {} }, action) => {
      if (action.type === 'message/addMessage') {
        // Simple mock implementation
        return state;
      }
      return state;
    },
    // Add any other reducers your component might need
  },
});

// Create a decorator to wrap components with Redux Provider
const withReduxProvider = (Story: StoryFn) => (
  <Provider store={mockStore}>
    <Story />
  </Provider>
);

const meta = {
  title: "Messages/AlertPanel",
  component: AlertPanel,
  tags: ["autodocs"],
  decorators: [withReduxProvider],
  parameters: {
    // Optional parameters
  },
  // Add default args that all stories will need
  args: {
    channelId: "mock-channel-id",
    responders: ["responder1", "responder2"]
  }
} satisfies Meta<typeof AlertPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FireRole: Story = {
  args: {
    role: "Fire",
  }
};

export const PoliceRole: Story = {
  args: {
    role: "Police",
  }
};