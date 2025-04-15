import { Meta, StoryObj } from "@storybook/react";
import { Button, Box, FormHelperText } from "@mui/material";
import React, { useState } from "react";

const roles = [
  "Citizen",
  "Dispatch",
  "Police",
  "Fire",
  "Nurse",
  "City Director",
  "Police Chief",
  "Fire Chief",
  "Administrator",
];

interface RoleSelectionProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  error?: boolean;
  errorMessage?: string;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({
  selectedRole,
  onSelectRole,
  error,
  errorMessage,
}) => {
  return (
    <Box width="100%" maxWidth="500px" my={2}>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        {roles.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? "contained" : "outlined"}
            color="primary"
            onClick={() => onSelectRole(role)}
            sx={{
              flex: "1 1 30%",
              marginBottom: "8px",
              marginLeft: "10px",
              marginRight: "10px",
              height: "70px",
            }}
          >
            {role}
          </Button>
        ))}
      </Box>
      {error && <FormHelperText error>{errorMessage}</FormHelperText>}
    </Box>
  );
};

const meta: Meta<typeof RoleSelection> = {
  title: "Common/RoleSelection",
  component: RoleSelection,
  tags: ["autodocs"],
  argTypes: {
    selectedRole: {
      control: "select",
      options: roles,
      description: "Currently selected role",
    },
    error: {
      control: "boolean",
      description: "Show error message if true",
    },
    errorMessage: {
      control: "text",
      description: "Error message displayed below the role buttons",
    },
    onSelectRole: {
      action: "role selected",
      description: "Triggered when a role is selected",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultRoleSelection: Story = {
  args: {
    selectedRole: "",
    error: false,
    errorMessage: "",
  },
  render: (args) => {
    const [selectedRole, setSelectedRole] = useState(args.selectedRole);

    return (
      <RoleSelection
        {...args}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
      />
    );
  },
};

export const ErrorRoleSelection: Story = {
  args: {
    selectedRole: "",
    error: true,
    errorMessage: "Please select a role",
  },
  render: (args) => {
    const [selectedRole, setSelectedRole] = useState(args.selectedRole);

    return (
      <RoleSelection
        {...args}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
      />
    );
  },
};
