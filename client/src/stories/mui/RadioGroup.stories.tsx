import { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

const radioOptions = ["structure fire", "wildfire"];

const meta: Meta<typeof RadioGroup> = {
  title: "Material UI/Radio Group",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "select",
      options: radioOptions,
      description: "Selected value for the radio group",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultRadioGroup: Story = {
  args: {
    value: radioOptions[0],
  },
  render: (args) => (
    <RadioGroup row value={args.value}>
      <FormControlLabel
        value={radioOptions[0]}
        control={<Radio />}
        label="Structure fire"
      />
      <FormControlLabel
        value={radioOptions[1]}
        control={<Radio />}
        label="Wildfire"
      />
    </RadioGroup>
  ),
};
