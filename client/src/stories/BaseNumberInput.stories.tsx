import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import BaseNumberInputWrapper from "../components/ChangeNumber";

const meta: Meta<typeof BaseNumberInputWrapper> = {
  title: "Components/BaseNumberInputWrapper",
  component: BaseNumberInputWrapper,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BaseNumberInputWrapper>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number>(3);

    return (
      <BaseNumberInputWrapper
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue ?? 0);
        }}
      />
    );
  },
};

export const WithMinValue: Story = {
  render: () => {
    const [value, setValue] = useState<number>(5);

    return (
      <BaseNumberInputWrapper
        value={value}
        min={2}
        onChange={(_, newValue) => {
          setValue(newValue ?? 2);
        }}
      />
    );
  },
};
