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
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import request from "../../utils/request";

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
  const [maxQuantity, setMaxQuantity] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchMaxQuantity = async () => {
      setLoading(true);
      try {
        const encodedItemName = encodeURIComponent(item.name);
        const response = await request(`/api/inventories/default/item/${encodedItemName}`);
        if (!response) {
          throw new Error(`Error: ${response.status}`);
        }
        
        setMaxQuantity(response.quantity);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch max quantity:", err);
        setError("Failed to load max quantity");
        setMaxQuantity(0); 
      } finally {
        setLoading(false);
      }
    };

    fetchMaxQuantity();
  }, [item.name]);

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
    setQuantity((prevQuantity) => {
      if (maxQuantity !== null && prevQuantity >= maxQuantity) {
        return maxQuantity; 
      }
      return prevQuantity + 1;
    });
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
          Max Quantity: {
            loading ? (
              <CircularProgress size={16} sx={{ ml: 1, verticalAlign: 'middle' }} />
            ) : error ? (
              <Typography component="span" color="error" variant="caption">Error loading</Typography>
            ) : (
              maxQuantity
            )
          }
        </Typography>
        
        <Box display="flex" alignItems="center" mt={1}>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Current Quantity:
            </Typography>
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
              disabled={maxQuantity !== null && quantity >= maxQuantity}
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