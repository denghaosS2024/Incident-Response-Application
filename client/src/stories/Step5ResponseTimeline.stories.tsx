import { Meta, StoryFn } from "@storybook/react";
import Step5ResponseTimeline, {
  Step5ResponseTimelineProps,
} from "../components/IncidentReport/Step5ResponseTimeline";

export default {
  title: "Components/Step5ResponseTimeline",
  component: Step5ResponseTimeline,
} as Meta;

const Template: StoryFn<Step5ResponseTimelineProps> = (args) => (
  <Step5ResponseTimeline {...args} />
);

const mockIncident = {
  assignHistory: [
    {
      name: "Car A",
      type: "Car",
      isAssign: true,
      usernames: ["Officer Smith"],
      timestamp: new Date().toISOString(),
      user: {
        username: "Officer Smith",
        role: "Police",
      },
    },
    {
      name: "Truck B",
      type: "Truck",
      isAssign: false,
      usernames: ["Driver John"],
      timestamp: new Date().toISOString(),
      user: {
        username: "Driver John",
        role: "Fire",
      },
    },
  ],
  openingDate: new Date().toISOString(),
  closingDate: new Date().toISOString(),
  commander: "Commander Dave",
  commanderDetail: {
    username: "Commander Dave",
    role: "Police",
  },
  priority: "High",
  patientName: "John Doe",
  incidentStateHistory: [
    {
      state: "Waiting",
      commander: "Commander Dave",
      timestamp: new Date().toISOString(),
      role: "Police",
      incidentState: "InProgress",
    },
    {
      state: "InProgress",
      commander: "Commander Dave",
      timestamp: new Date().toISOString(),
      role: "Police",
      incidentState: "Closed",
    },
  ],
};

export const Default = Template.bind({});
Default.args = {
  incident: mockIncident,
};

export const WithPatientInfo = Template.bind({});
WithPatientInfo.args = {
  incident: {
    ...mockIncident,
    patientName: "Alice Brown",
  },
};

export const MultipleStateChanges = Template.bind({});
MultipleStateChanges.args = {
  incident: {
    ...mockIncident,
    incidentStateHistory: [
      {
        state: "Waiting",
        commander: "Commander Dave",
        timestamp: new Date().toISOString(),
        role: "Police",
        incidentState: "Waiting",
      },
      {
        state: "InProgress",
        commander: "Commander Dave",
        timestamp: new Date().toISOString(),
        role: "Police",
        incidentState: "Closed",
      },
      {
        state: "Closed",
        commander: "Commander Dave",
        timestamp: new Date().toISOString(),
        role: "Police",
        incidentState: "Assigned",
      },
    ],
  },
};

export const NoAssignments = Template.bind({});
NoAssignments.args = {
  incident: {
    ...mockIncident,
    assignHistory: [],
  },
};
