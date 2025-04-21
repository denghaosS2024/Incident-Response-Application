import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react";
import IncidentCard from "../components/FundingCenter/IncidentCard";
import type IIncident from "../models/Incident";

const theme = createTheme();

const meta: Meta<typeof IncidentCard> = {
  title: "Components/IncidentCard",
  component: IncidentCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof IncidentCard>;

// Mock data
const baseIncident: IIncident = {
  incidentId: "INC12345",
  openingDate: new Date("2025-04-20T10:30:00Z").toISOString(),
  priority: "E",
  fund_left: 300,
  funding: 5000,
};

export const Default: Story = {
  args: {
    incident: baseIncident,
  },
};
