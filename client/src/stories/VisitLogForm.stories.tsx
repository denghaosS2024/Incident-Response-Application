import { Meta, StoryObj } from "@storybook/react";
import VisitLogForm from "../components/feature/Reach911/VisitLogForm";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
const mockStore = configureStore({
  reducer: {
    patientState: () => ({
      patients: [
        {
          patientId: "PAT-123",
          username: "testuser",
          hospitalId: "HOSP-123",
        },
      ],
    }),
    incidentState: () => ({
      incident: {
        incidentId: "INC-123",
        questions: [],
      },
    }),
    contactState: () => ({
      loading: false,
    }),
  },
});

const mockLocalStorage = {
  getItem: (key: string) => {
    if (key === "role") return "Nurse";
    return null;
  },
  setItem: () => null,
  removeItem: () => null,
  clear: () => null,
  length: 0,
  key: () => null,
};

// Apply the localStorage mock
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const meta = {
  title: "FindHospital/VisitLogForm",
  component: VisitLogForm,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    // Set up any additional parameters needed
    layout: "centered",
  },
} satisfies Meta<typeof VisitLogForm>;

export default meta;
type Story = StoryObj<typeof VisitLogForm>;

const visitLog = {
  username: "testuser",
  visitLogId: "VISIT-123",
  active: true,
};

export const Default: Story = {
  args: {
    username: visitLog.username,
  },
};

export const ActiveVisitLog: Story = {
  args: {
    username: visitLog.username,
    visitLogId: visitLog.visitLogId,
    active: true,
  },
};

export const ReadOnlyVisitLog: Story = {
  args: {
    username: visitLog.username,
    visitLogId: visitLog.visitLogId,
    active: false,
  },
};
