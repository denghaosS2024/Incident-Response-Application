import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

// Icons for emergency types
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";

// Define types for the component props
interface EmergencyTypeCardProps {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isSelected?: boolean;
  onSelect?: (type: string) => void;
}

// Emergency Type Card Component
const EmergencyTypeCard: React.FC<EmergencyTypeCardProps> = ({
  type,
  title,
  description,
  icon,
  color,
  isSelected = false,
  onSelect = () => {
    /* Default empty implementation */
  },
}) => {
  return (
    <Card
      elevation={isSelected ? 4 : 1}
      sx={{
        border: isSelected ? `1.5px solid ${color}` : "1.5px solid #dddddd",
        transition: "all 0.3s ease",
        maxHeight: "28%",
        boxShadow: "none",
      }}
    >
      <CardActionArea
        onClick={() => onSelect(type)}
        sx={{ display: "flex", justifyContent: "center", py: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {icon && (
            <Box
              sx={{
                fontSize: 36,
                color: color,
                mb: 0.25,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ fontWeight: "medium", fontSize: "1rem", lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ fontSize: "0.85rem", lineHeight: 1.2 }}
          >
            {description}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const meta = {
  title: "Components/EmergencyTypeCard",
  component: EmergencyTypeCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Card component for emergency type selection in the 911 flow. Used to select between Fire, Medical, and Police emergencies.",
      },
    },
  },
  argTypes: {
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof EmergencyTypeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Fire emergency card
export const FireCard: Story = {
  args: {
    type: "Fire",
    title: "Fire",
    description: "Report a fire emergency",
    icon: <LocalFireDepartmentIcon />,
    color: "#f44336",
    isSelected: false,
  },
};

// Medical emergency card
export const MedicalCard: Story = {
  args: {
    type: "Medical",
    title: "Medical",
    description: "Report a medical emergency",
    icon: <LocalHospitalIcon />,
    color: "#2196f3",
    isSelected: false,
  },
};

// Police emergency card
export const PoliceCard: Story = {
  args: {
    type: "Police",
    title: "Police",
    description: "Report a police emergency",
    icon: <LocalPoliceIcon />,
    color: "#4caf50",
    isSelected: false,
  },
};

// Selected state examples
export const FireCardSelected: Story = {
  args: {
    type: "Fire",
    title: "Fire",
    description: "Report a fire emergency",
    icon: <LocalFireDepartmentIcon />,
    color: "#f44336",
    isSelected: true,
  },
};

export const MedicalCardSelected: Story = {
  args: {
    type: "Medical",
    title: "Medical",
    description: "Report a medical emergency",
    icon: <LocalHospitalIcon />,
    color: "#2196f3",
    isSelected: true,
  },
};

export const PoliceCardSelected: Story = {
  args: {
    type: "Police",
    title: "Police",
    description: "Report a police emergency",
    icon: <LocalPoliceIcon />,
    color: "#4caf50",
    isSelected: true,
  },
};
