import { Meta, StoryObj } from "@storybook/react";
import { Channel } from "../components/ChannelList";
import IChannel from "../models/Channel"; // Adjust the import based on your structure

const meta: Meta<typeof Channel> = {
  title: "Components/Channel",
  component: Channel,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Channel>;

const channel: IChannel = {
  //_id is ObjectID
  _id: "614a9d4c2e1c2e1c2e1c2e1",
  name: "Channel 1",
  description: "Description for Channel 1",
  owner: {
    _id: "614a93332e1c2e1c2e1c2e1",
    username: "Owner 1",
    role: "admin",
  },
  closed: false,
  users: [
    {
      _id: "614a9d4c2e1c2e1c2e1c8e1",
      username: "User 1",
      role: "citizen",
    },
  ],
};
// Mock function to simulate selecting a channel
const onSelectChannel = (id: string) => {
  console.log(`Channel selected: ${id}`);
};

export const Default: Story = {
  args: {
    channel,
    onClick: onSelectChannel,
  },
};

export const Editable: Story = {
  args: {
    channel,
    isSettingButton: true,
    onClick: onSelectChannel,
  },
};

export const SelectedChannel: Story = {
  args: {
    channel,
    onClick: onSelectChannel,
    selectedChannelId: channel._id,
  },
};
