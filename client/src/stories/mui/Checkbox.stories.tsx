import { Meta, StoryObj } from "@storybook/react";
import { Checkbox, CheckboxProps } from "@mui/material";

const meta: Meta<CheckboxProps> = {
  title: "Material UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ClickableCheckbox: Story = {
  args: {
    checked: false,
  },
  render: (args) => {
    return <Checkbox {...args} />;
  },
};
