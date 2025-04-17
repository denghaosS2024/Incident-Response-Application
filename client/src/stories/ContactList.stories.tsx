import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import ContactList from "../components/ContactList";

const meta = {
  title: "Contacts/ContactList",
  component: ContactList,
  parameters: {
    users: [],
    onClick: action("chat with"),
    loading: false,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContactList>;

export default meta;
type Story = StoryObj<typeof meta>;

const roleContactMap: Record<string, string[]> = {
  Citizen: ["Citizen", "Administrator"],
  Dispatch: ["Dispatch", "Police", "Fire", "Administrator"],
  Police: ["Dispatch", "Police", "Fire", "Administrator"],
  Fire: ["Dispatch", "Police", "Fire", "Administrator"],
  Nurse: ["Nurse", "Administrator"],
  Administrator: [
    "Dispatch",
    "Police",
    "Fire",
    "Nurse",
    "Citizen",
    "Administrator",
  ],
  "City Director": ["City Director", "Dispatch"],
  "Police Chief": ["Police Chief", "City Director"],
  "Fire Chief": ["Fire Chief", "City Director", "Police Chief"],
};

const allUsers = [
  { _id: "id-A", username: "Citizen (Online)", role: "Citizen", online: true },
  { _id: "id-B", username: "Police (Offline)", role: "Police", online: false },
  { _id: "id-C", username: "Firefighter (Online)", role: "Fire", online: true },
  {
    _id: "id-D",
    username: "Administrator (Offline)",
    role: "Administrator",
    online: false,
  },
  {
    _id: "id-E",
    username: "Dispatcher (Online)",
    role: "Dispatch",
    online: true,
  },
  { _id: "id-F", username: "Nurse (Offline)", role: "Nurse", online: false },
  { _id: "id-G", username: "Nurse (Online)", role: "Nurse", online: true },
  {
    _id: "id-H",
    username: "City Director (Offline)",
    role: "City Director",
    online: false,
  },
  {
    _id: "id-I",
    username: "Police Chief (Online)",
    role: "Police Chief",
    online: true,
  },
  {
    _id: "id-J",
    username: "Fire Chief (Offline)",
    role: "Fire Chief",
    online: false,
  },
];

const getFilteredUsers = (currentRole: string) => {
  const allowedRoles = roleContactMap[currentRole] || [];
  return allUsers
    .filter((user) => allowedRoles.includes(user.role))
    .sort((a, b) => Number(b.online) - Number(a.online));
};

export const CitizenView: Story = {
  args: {
    users: getFilteredUsers("Citizen"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const PoliceView: Story = {
  args: {
    users: getFilteredUsers("Police"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const AdminView: Story = {
  args: {
    users: getFilteredUsers("Administrator"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const NurseView: Story = {
  args: {
    users: getFilteredUsers("Nurse"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const FireChiefView: Story = {
  args: {
    users: getFilteredUsers("Fire Chief"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const PoliceChiefView: Story = {
  args: {
    users: getFilteredUsers("Police Chief"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const CityDirectorView: Story = {
  args: {
    users: getFilteredUsers("City Director"),
    onClick: action("chat with"),
    loading: false,
  },
};

export const NoUsers: Story = {
  args: { users: [], loading: false },
};
