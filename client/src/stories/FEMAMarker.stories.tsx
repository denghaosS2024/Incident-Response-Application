import { Meta, StoryObj } from "@storybook/react";
import FEMAMarker from "../components/feature/SARTask/FEMAMarker";

const meta: Meta<typeof FEMAMarker> = {
  title: "Components/FEMAMarker",
  component: FEMAMarker,
  tags: ["autodocs"],
  argTypes: {
    top: {
      control: "text",
      description: "Text for top side of the marker",
    },
    right: {
      control: "text",
      description: "Text for right side of the marker",
    },
    bottom: {
      control: "text",
      description: "Text for bottom side of the marker",
    },
    left: {
      control: "text",
      description: "Text for left side of the marker",
    },
    size: {
      control: { type: "number", min: 50, max: 400, step: 10 },
      description: "Size of the marker in pixels",
    },
    strokeWidth: {
      control: { type: "number", min: 1, max: 20, step: 1 },
      description: "Stroke width of the X in pixels",
    },
    strokeColor: {
      control: "color",
      description: "Color of the X",
    },
    textColor: {
      control: "color",
      description: "Color of the text",
    },
    backgroundColor: {
      control: "color",
      description: "Background color of the marker",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FullMarker: Story = {
  args: {
    top: "04.01.25 10:56am",
    right: "Gas Rats Fire",
    bottom: "3-Immediate 1-Urgent",
    left: "STeam1 04.01.25 5:56am",
    size: 300,
    strokeWidth: 6,
    strokeColor: "#FF0000",
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
};

export const InitialMarker: Story = {
  args: {
    top: "",
    right: "",
    bottom: "",
    left: "STeam1 04.01.25 5:56am",
  },
};
