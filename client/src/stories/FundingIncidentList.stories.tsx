import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react";
import IncidentList from "../components/FundingCenter/IncidentList";
import type IIncident from "../models/Incident";

const theme = createTheme();

const meta: Meta<typeof IncidentList> = {
  title: "Components/FundingIncidentList",
  component: IncidentList,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof IncidentList>;

// Mock incidents
const mockIncidents: IIncident[] = [
  {
    incidentId: "INC001",
    openingDate: new Date("2025-04-18T12:00:00Z").toISOString(),
    priority: "U",
    fund_left: 180,
    funding: 1000,
  },
  {
    incidentId: "INC002",
    openingDate: new Date("2025-04-19T08:45:00Z").toISOString(),
    priority: "E",
    fund_left: 5000,
    funding: 8000,
  },
  {
    incidentId: "INC003",
    openingDate: new Date("2025-04-20T15:30:00Z").toISOString(),
    priority: "U",
    fund_left: 90,
    funding: 200,
  },
];

// Story variants
export const Default: Story = {
  args: {
    incidents: mockIncidents,
  },
};

export const Empty: Story = {
  args: {
    incidents: [],
  },
};
