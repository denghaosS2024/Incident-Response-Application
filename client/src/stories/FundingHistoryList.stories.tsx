import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react";
import FundingHistoryList from "../components/FundingCenter/FundingHistoryList";

const theme = createTheme();

const meta: Meta<typeof FundingHistoryList> = {
  title: "Components/FundingHistoryList",
  component: FundingHistoryList,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FundingHistoryList>;

export const Default: Story = {
  args: {
    fundingHistory: [
      {
        type: "Assign",
        sender: {
          _id: "64f1a2b3c4d5e6f7a8b9c0d1",
          username: "director_linda",
          role: "director",
        },
        timestamp: new Date("2025-04-15T09:30:00Z").toISOString(),
        amount: 50000,
        reason: "Annual budget allocation for new equipment",
      },
      {
        type: "Request",
        sender: {
          _id: "64f1a2b3c4d5e6f7a8b9c0d1",
          username: "firechief",
          role: "Fire Chief",
        },
        timestamp: new Date("2025-04-15T10:30:00Z").toISOString(),
        amount: 5000,
        reason: "Annual budget allocation for new equipment",
      },
    ],
  },
};
