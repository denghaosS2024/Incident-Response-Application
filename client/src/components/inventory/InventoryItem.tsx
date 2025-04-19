import { Add, Remove } from "@mui/icons-material";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import HardwareIcon from "@mui/icons-material/Hardware";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";

interface InventoryItemProps {
  name: string;
  description: string;
  quantity: number;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  name,
  description,
  quantity: initialQuantity,
}) => {
  const [quantity, setQuantity] = React.useState(initialQuantity);
  const getIconForName = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Medical Kit": <MedicalServicesIcon />,
      "Repair Tools": <HomeRepairServiceIcon />,
      Emergency: <EmergencyShareIcon />,
    };

    return iconMap[name] || <HardwareIcon />;
  };

  const icon = getIconForName(name);
  const onDecrease = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 0));
  };

  const onIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar>{icon}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center">
            <Typography variant="body1" fontWeight="bold" mx={1}>
              {name}:
            </Typography>
            <IconButton size="small" onClick={onDecrease}>
              <Remove />
            </IconButton>
            <Typography variant="body2" mx={1}>
              {quantity}
            </Typography>
            <IconButton size="small" onClick={onIncrease}>
              <Add />
            </IconButton>
          </Box>
        }
        secondary={description}
      />
    </ListItem>
  );
};

export default InventoryItem;
