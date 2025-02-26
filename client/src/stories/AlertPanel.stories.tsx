import { Meta, StoryObj } from "@storybook/react";

import AlertPanel from "../components/AlertPanel";

const meta: Meta = {
  title: "Messages/AlertPanel",
  component: AlertPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof AlertPanel>;

export default meta
type Story = StoryObj<typeof meta>

export const FireRole: Story = {
  args: {
    role: "fire",
  }
};

export const PoliceRole: Story = {
    args: {
      role: "police",
    }
};