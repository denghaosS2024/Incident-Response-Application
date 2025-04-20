import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import {
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
        console.log('Default inventory data:', data);
        
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

  const handleViewItemDetails = (itemId: string): void => {
    navigate(`/defaultItem/${itemId}`);
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
      <Typography variant="h5" gutterBottom>
        Default Truck Inventory
      </Typography>
      
      <Grid container spacing={2}>
        {defaultItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card>
                <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                    {item.name}
                    </Typography>
                    <IconButton
                     color="primary"
                     aria-label="view details"
                     onClick={() => handleViewItemDetails(item._id)}
                    >
                    <ArrowForwardIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                    <Box display="flex" alignItems="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item._id, -1)}
                        disabled={item.quantity <= 0}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => handleQuantityChange(item._id, 1)}
                      >
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                <Typography variant="body2" color="text.secondary">
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
          backgroundColor: "#1976d2", // primary blue color
          "&:hover": {
            backgroundColor: "#1565c0", // darker blue on hover
          },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default DefaultTruckInventory;