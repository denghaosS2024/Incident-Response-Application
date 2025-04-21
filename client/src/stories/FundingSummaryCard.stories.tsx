import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react";
import FundingSummaryCard from "../components/FundingCenter/FundingSummaryCard";

const theme = createTheme();

const meta: Meta<typeof FundingSummaryCard> = {
  title: "Components/FundingSummaryCard",
  component: FundingSummaryCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FundingSummaryCard>;

export const Default: Story = {
  args: {
    totalFunds: 5000,
  },
};
