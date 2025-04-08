import type { Meta, StoryObj } from "@storybook/react";
import IncidentItem from "../components/AllocateResource/IncidentItem"; // Adjust path if needed
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import IIncident, { IncidentPriority } from "../models/Incident";
import { IncidentType } from "../models/Incident";

const type: IncidentType = IncidentType.Fire;
const priority: IncidentPriority = IncidentPriority.Urgent;

const handleDragEnd = (result: DropResult) => {
  console.log("Drag ended:", result);
};
const meta: Meta<typeof IncidentItem> = {
  title: "Resources/IncidentItem",
  component: IncidentItem,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{ width: "600px", padding: "20px", border: "1px solid #eee" }}
        >
          <Story />
        </div>
      </DragDropContext>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IncidentItem>;

// Sample incident with vehicles
const incidentWithVehicles: IIncident = {
  _id: "sample-id-123",
  incidentId: "INC-001",
  openingDate: "2023-10-01T10:30:00Z",
  type: type,
  priority: priority,
  incidentState: "Active",
  owner: "Dispatcher1",
  commander: "Commander1",
  caller: "John Doe",
  address: "123 Main St",
  assignedVehicles: [
    {
      type: "Car",
      name: "Police Car 1",
      usernames: ["Officer Smith", "Officer Johnson"],
    },
    {
      type: "Truck",
      name: "Fire Truck 1",
      usernames: ["Firefighter Adams", "Firefighter Brown"],
    },
  ],
  questions: null,
};

const incidentWithoutVehicles: IIncident = {
  ...incidentWithVehicles,
  incidentId: "INC-002",
  assignedVehicles: [],
  questions: null,
};

const incidentWithEmptyPersonnel: IIncident = {
  ...incidentWithVehicles,
  incidentId: "INC-003",
  assignedVehicles: [
    {
      type: "Car",
      name: "Police Car 2",
      usernames: [],
    },
    {
      type: "Truck",
      name: "Fire Truck 2",
      usernames: [],
    },
  ],
  questions: null,
};

export const WithVehicles: Story = {
  args: {
    incident: incidentWithVehicles,
  },
};

export const WithoutVehicles: Story = {
  args: {
    incident: incidentWithoutVehicles,
  },
};

export const WithEmptyPersonnel: Story = {
  args: {
    incident: incidentWithEmptyPersonnel,
  },
};
