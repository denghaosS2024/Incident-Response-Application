import { Add, Remove } from "@mui/icons-material";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import HardwareIcon from "@mui/icons-material/Hardware";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

interface InventoryItemData {
  name: string;
  description?: string;
  quantity: number;
  _id?: string;
}

interface InventoryItemProps {
  item: InventoryItemData;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item }) => {
  const [quantity, setQuantity] = React.useState(item.quantity);

  const getIconForName = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Medical Kit": <MedicalServicesIcon />,
      "Repair Tools": <HomeRepairServiceIcon />,
      Emergency: <EmergencyShareIcon />,
    };
    
    return iconMap[name] || <HardwareIcon />;
  };
  
  const icon = getIconForName(item.name);

  const onDecrease = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 0));
  };
  
  const onIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 1 }}>{icon}</Avatar>
            <Typography variant="h6">
              {item.name}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Max Quantity: {quantity}
        </Typography>
        
        <Box display="flex" alignItems="center" mt={1}>
          <Box display="flex" alignItems="center">
            <IconButton 
              size="small" 
              onClick={onDecrease}
              disabled={quantity <= 0}
            >
              <Remove fontSize="small" />
            </IconButton>
            <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton 
              size="small"
              onClick={onIncrease}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Description: {item.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryItem;