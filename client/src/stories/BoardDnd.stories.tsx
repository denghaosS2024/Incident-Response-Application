import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import Board from "../components/Board";
import { Provider } from "react-redux";
import { store } from "../app/store";

export default {
  title: "Groups/BoardDnd",
  component: Board,
  tags: ['autodocs'],
  decorators: [(Story) => <Provider store={store}><Story /></Provider>],
  parameters: {
    docs: {
      description: {
        component: 'The `Board` component represents a draggable board where users can be added to different groups. It allows setting the group name, description, and users through controlled state, making it suitable for drag-and-drop functionality with Redux integration.',
      },
    },
  },
} as Meta;

const Template: Story = (args) => {
  const [users, setUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerResetBoard, setTriggerResetBoard] = useState(0);

  // Define the mock resetBoardState function
  const resetBoardState = () => {
    setUsers([]);  // Reset users
    setGroupName("");  // Reset group name
    setDescription("");  // Reset description
  };

  return (
    <Board
      setUsers={setUsers}
      onGroupClick={(c) => {setGroupName(c.name)}}  // just a random func to make eslint happy
      triggerResetBoard={triggerResetBoard}
      {...args}
    />
  );
};

export const Default = Template.bind({});
Default.args = {};
