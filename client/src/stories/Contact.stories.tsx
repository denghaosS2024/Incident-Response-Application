import { Meta, Story } from "@storybook/react";
import { useState } from "react";
import EmergencyContactField from "../components/Profile/EmergencyContactField"; // Adjust path as necessary
import { IEmergencyContact } from "../models/Profile";

export default {
  title: "Components/EmergencyContactField",
  component: EmergencyContactField,
} as Meta;

const Template: Story = (args) => {
  const [contactList, setContactList] = useState<IEmergencyContact[]>([
    { name: "John Doe", phone: "1234567890", email: "john@example.com" },
    { name: "Jane Smith", phone: "9876543210", email: "jane@example.com" },
  ]);

  return (
    <EmergencyContactField
      contactList={contactList}
      setContactList={setContactList}
      {...args}
    />
  );
};

export const Default = Template.bind({});
Default.args = {};

export const EmptyList = Template.bind({});
EmptyList.args = {
  contactList: [],
};

export const WithMultipleContacts = Template.bind({});
WithMultipleContacts.args = {
  contactList: [
    { name: "Alice Brown", phone: "5556667777", email: "alice@example.com" },
    { name: "Bob Green", phone: "8889990000", email: "bob@example.com" },
    { name: "Charlie Blue", phone: "1112223333", email: "charlie@example.com" },
  ],
};
