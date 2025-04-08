import { Meta, StoryObj } from "@storybook/react";

import AlertButton from "../components/AlertButton";

const meta: Meta = {
  title: "Messages/AlertButton",
  component: AlertButton,
  tags: ["autodocs"],
} satisfies Meta<typeof AlertButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vacate: Story = {
  args: {
    label: "VACATE",
    bgColor: "red",
    textColor: "white",
  },
};

export const RescueInProgress: Story = {
  args: {
    label: "RESCUE In Progress",
    bgColor: "#ff33cc",
    textColor: "white",
  },
};

export const AllClear: Story = {
  args: {
    label: "ALL CLEAR",
    bgColor: "#00e6e6",
    textColor: "black",
  },
};

export const LifeHaz: Story = {
  args: {
    label: "LIFE HAZ",
    bgColor: "purple",
    textColor: "white",
  },
};

export const PAR: Story = {
  args: {
    label: "P.A.R.",
    bgColor: "green",
    textColor: "white",
  },
};

export const UtilitiesOn: Story = {
  args: {
    label: "UTILITIES ON",
    bgColor: "yellow",
    textColor: "black",
  },
};

export const VertVent: Story = {
  args: {
    label: "VERT. VENT",
    bgColor: "#0099ff",
    textColor: "white",
  },
};

export const CrossVent: Story = {
  args: {
    label: "CROSS VENT",
    bgColor: "lightblue",
    textColor: "black",
  },
};

export const UtilitiesOff: Story = {
  args: {
    label: "UTILITIES OFF",
    bgColor: "darkred",
    textColor: "white",
  },
};
