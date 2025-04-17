import type { Meta, StoryObj } from "@storybook/react";
import VehicleList from "../components/AllocateResource/VehicleList";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

const handleDragEnd = (result: DropResult) => {
  console.log("Drag ended:", result);
};

const meta: Meta<typeof VehicleList> = {
  title: "Resources/VehicleList",
  component: VehicleList,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{ width: "400px", padding: "20px", border: "1px solid #eee" }}
        >
          <Story />
        </div>
      </DragDropContext>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Title for the vehicle list section",
    },
    vehicles: {
      control: "object",
      description: "Array of vehicle objects to display",
    },
    droppableId: {
      control: "text",
      description: "Unique ID for the droppable area",
    },
    vehicleType: {
      control: "select",
      options: ["Car", "Truck"],
      description: "Type of vehicles in this list",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VehicleList>;

export const Cars: Story = {
  args: {
    title: "Cars",
    vehicles: [
      {
        _id: "car1",
        name: "Car 1",
        usernames: ["Officer Smith", "Officer Johnson"],
        assignedCity: "New York",
        assignedIncident: "",
      },
      {
        _id: "car2",
        name: "Car 2",
        usernames: [],
        assignedCity: "New York",
        assignedIncident: "",
      },
    ],
    droppableId: "cars",
    vehicleType: "Car",
  },
};

export const Trucks: Story = {
  args: {
    title: "Trucks",
    vehicles: [
      {
        _id: "truck1",
        name: "Truck 1",
        usernames: ["Officer Williams"],
        assignedCity: "New York",
        assignedIncident: "",
      },
      {
        _id: "truck2",
        name: "Truck 2",
        usernames: [],
        assignedCity: "New York",
        assignedIncident: "",
      },
    ],
    droppableId: "trucks",
    vehicleType: "Truck",
  },
};
