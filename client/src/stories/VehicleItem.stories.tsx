import type { Meta, StoryObj } from "@storybook/react";
import VehicleItem from "../components/AllocateResource/VehicleItem";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

const handleDragEnd = (result: DropResult) => {
  console.log("Drag ended:", result);
};

const meta: Meta<typeof VehicleItem> = {
  title: "Resources/VehicleItem",
  component: VehicleItem,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The `Column` component represents a draggable column containing tasks or users. It supports drag-and-drop functionality through `react-beautiful-dnd`. You can also associate users with groups and click on a group to perform specific actions.",
      },
    },
  },
  decorators: [
    (Story) => (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="story-droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <Story />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "The name of the vehicle",
    },
    usernames: {
      control: "object",
      description: "Array of personnel assigned to the vehicle",
    },
    type: {
      control: "select",
      options: ["Car", "Truck"],
      description: "Type of vehicle (Car or Truck)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VehicleItem>;

export const Default: Story = {
  args: {
    name: "Vehicle 1",
    usernames: ["Officer Smith", "Officer Johnson"],
    type: "Car",
  },
};
