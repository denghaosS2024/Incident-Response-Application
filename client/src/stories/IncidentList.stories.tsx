import type { Meta, StoryObj } from "@storybook/react";
import IncidentList from "../components/AllocateResource/IncidentList";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import IIncident, { IncidentPriority, IncidentType } from "../models/Incident";

// Mock for IncidentItem to avoid dependency issues in Storybook
// jest.mock('./IncidentItem', () => {
//   return {
//     __esModule: true,
//     default: ({ incident }) => (
//       <div style={{ border: '1px solid #ddd', margin: '10px', padding: '10px' }}>
//         <h4>{incident.incidentId}</h4>
//         <div>Type: {incident.type}</div>
//         <div>Priority: {incident.priority}</div>
//         <div>Vehicles: {incident.assignedVehicles.length}</div>
//       </div>
//     ),
//   };
// });

// // Mock for RoleIcon if needed
// jest.mock('@/components/common/RoleIcon', () => ({
//   __esModule: true,
//   default: (roleType: string) => <div>{roleType} Icon</div>,
// }));

const type: IncidentType = IncidentType.Fire;
const priority: IncidentPriority = IncidentPriority.Urgent;

const handleDragEnd = (result: DropResult) => {
  console.log("Drag ended:", result);
};

const meta: Meta<typeof IncidentList> = {
  title: "Resources/IncidentList",
  component: IncidentList,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ width: "800px", padding: "20px" }}>
          <Story />
        </div>
      </DragDropContext>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IncidentList>;

// Create a function to generate sample incidents
const createSampleIncident = (id: string, hasVehicles: boolean): IIncident => ({
  _id: `sample-id-${id}`,
  incidentId: `INC-${id}`,
  openingDate: "2023-10-01T10:30:00Z",
  type: type,
  priority: priority,
  incidentState: "Active",
  owner: "Dispatcher1",
  commander: "Commander1",
  caller: "John Doe",
  address: "123 Main St",
  questions: null,
  assignedVehicles: hasVehicles
    ? [
        {
          type: "Car",
          name: `Police Car ${id}A`,
          usernames: ["Officer Smith", "Officer Johnson"],
        },
        {
          type: "Truck",
          name: `Fire Truck ${id}B`,
          usernames: ["Firefighter Adams", "Firefighter Brown"],
        },
      ]
    : [],
});

// Create sample data for different scenarios
const multipleIncidents: IIncident[] = [
  createSampleIncident("001", true),
  createSampleIncident("002", false),
  createSampleIncident("003", true),
];

export const WithMultipleIncidents: Story = {
  args: {
    incidents: multipleIncidents,
  },
};

export const WithSingleIncident: Story = {
  args: {
    incidents: [createSampleIncident("001", true)],
  },
};

export const EmptyList: Story = {
  args: {
    incidents: [],
  },
};
