import { Meta, StoryObj } from "@storybook/react";

import ChannelList from "../components/ChannelList";

const meta = {
  title: "Messages/ChannelList",
  component: ChannelList,
  parameters: {
    channels: [],
    loading: false,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChannelList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    channels: [
      {
        _id: "id-1",
        name: "Public",
        owner: { _id: "id-1", username: "UserA", role: "Admin" },
        closed: false,
        users: [],
      },
      {
        _id: "id-2",
        name: "UserB",
        owner: { _id: "id-2", username: "UserB", role: "Admin" },
        closed: false,
        users: [],
      },
    ],
    loading: false,
  },
};

export const Loading: Story = { args: { loading: true } };
