import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import DepartmentFundingTable, {
  DepartmentRequest,
} from "../components/FundingCenter/DepartmentFundingTable";

const meta: Meta<typeof DepartmentFundingTable> = {
  title: "FundingCenter/DepartmentFundingTable",
  component: DepartmentFundingTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    departmentRequests: {
      control: "object",
      description: "Array of department funding data",
    },
    onChatClick: {
      action: "chat clicked",
      description: "Function to handle chat button click events",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DepartmentFundingTable>;

// Sample data for stories
const sampleRequests: DepartmentRequest[] = [
  {
    name: "FireChief1",
    request: 1000,
    department: "Fire",
  },
  {
    name: "PoliceChief1",
    request: 500,
    department: "Police",
  },
];
export const Default: Story = {
  args: {
    departmentRequests: sampleRequests,
    onChatClick: (name, department) =>
      console.log(`Chat clicked for ${name} (${department})`),
  },
};
