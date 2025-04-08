import { Meta, StoryObj } from "@storybook/react";
import { Box, ListItemText } from "@mui/material";
import {
  Message,
  PermContactCalendar as Contact,
  Groups,
  LocationOn,
  PriorityHigh as ExclamationIcon,
} from "@mui/icons-material";

const meta: Meta = {
  title: "Material UI/List",
  component: Box,
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "The text displayed inside the box.",
    },
    icon: {
      control: "radio",
      options: ["message", "contact", "groups", "location", "incident"],
      mapping: {
        message: <Message />,
        contact: <Contact />,
        groups: <Groups />,
        location: <LocationOn />,
        incident: <ExclamationIcon />,
      },
      description: "The icon displayed inside the box.",
    },
    isEmergency: {
      control: "boolean",
      description:
        "If true, the background color is red (for emergency items like 911).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Template = ({
  text = "Default",
  icon = <Message />,
  isEmergency = false,
}: Partial<{ text: string; icon: JSX.Element; isEmergency: boolean }>) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 10px",
      border: "1.5px solid #ddd",
      borderRadius: "8px",
      backgroundColor: isEmergency ? "#ff0000" : "#fff",
      width: "250px",
      "&:hover": { backgroundColor: isEmergency ? "#e60000" : "#f0f0f0" },
    }}
  >
    <ListItemText
      sx={{
        flex: 1,
        textAlign: "center",
        color: isEmergency ? "#fff" : "inherit",
      }}
      primary={text}
    />
    <Box sx={{ ml: "auto", pr: 1 }}>{icon}</Box>
  </Box>
);

export const MessageBox: Story = {
  args: {
    text: "Messages",
    icon: <Message />,
    isEmergency: false,
  },
  render: (args) => <Template {...args} />,
};

export const ContactBox: Story = {
  args: {
    text: "Contacts",
    icon: <Contact />,
    isEmergency: false,
  },
  render: (args) => <Template {...args} />,
};

export const GroupsBox: Story = {
  args: {
    text: "Groups",
    icon: <Groups />,
    isEmergency: false,
  },
  render: (args) => <Template {...args} />,
};

export const MapBox: Story = {
  args: {
    text: "Map",
    icon: <LocationOn />,
    isEmergency: false,
  },
  render: (args) => <Template {...args} />,
};

export const EmergencyBox: Story = {
  args: {
    text: "911",
    icon: <ExclamationIcon />,
    isEmergency: true,
  },
  render: (args) => <Template {...args} />,
};
