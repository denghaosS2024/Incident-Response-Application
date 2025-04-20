import { Add, Remove } from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import HardwareIcon from "@mui/icons-material/Hardware";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import request from "../utils/request";


interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  description: string; 
}



const DefaultTruckInventory: React.FC = () => {
  const [defaultItems, setDefaultItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleQuantityChange = (itemId: string, change: number): void => {
    setDefaultItems(prevItems => 
      prevItems.map(item => {
        if (item._id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    const fetchDefaultInventory = async (): Promise<void> => {
      try {
        const data = await request('/api/inventories/category/default');
        
        if (data) {
          setDefaultItems(data.items);
        } else {
          console.error('Unexpected API response format:', data);
          setDefaultItems([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchDefaultInventory();
  }, []);

  const getIconForName = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Medical Kit": <MedicalServicesIcon />,
      "Repair Tools": <HomeRepairServiceIcon />,
    };
    
    return iconMap[name] || <HardwareIcon />;
  };

  
  const handleAddNewItem = (): void => {
    navigate('/defaulttruckadditem');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {defaultItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card>
                <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 1 }}>{getIconForName(item.name)}</Avatar>
                      <Typography variant="h6">
                        {item.name}
                      </Typography>
                    </Box>

                </Box>

                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Default Max Quantity: 
                    </Typography>
                    <Box display="flex" alignItems="center" ml={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item._id, -1)}
                        disabled={item.quantity <= 0}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(item._id, 1)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                    </Box>
                  </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Description: {item.description}
                </Typography>
                </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddNewItem}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#1976d2", 
          "&:hover": {
            backgroundColor: "#1565c0", 
          },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default DefaultTruckInventory;