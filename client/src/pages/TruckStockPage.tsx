import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import request from "../utils/request";

// Define TypeScript interfaces
interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
}

interface TruckInventory {
  _id: string;
  category: string;
  items: InventoryItem[];
}

const TruckStockPage: React.FC = () => {
  const [trucks, setTrucks] = useState<TruckInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTruckInventories = async (): Promise<void> => {
      try {
        // Using request instead of axios
        const data = await request('/api/inventories/non-default');
        
        if (Array.isArray(data)) {
          setTrucks(data);
        } else {
          if (data && Array.isArray(data.data)) {
            setTrucks(data.data);
          } else {
            console.error('Unexpected API response format:', data);
            setTrucks([]);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchTruckInventories();
  }, []);

  const handleViewItems = (category: string): void => {
    navigate(`/inventory/${category}`);
  };
  
  const handleEditDefaultItems = (): void => {
    navigate('/defaulttruckinventory');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(trucks)) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error: Expected truck data to be an array
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Truck Inventory
      </Typography>
      
      <Grid container spacing={2}>
        {trucks.map((truck) => (
          <Grid item xs={12} sm={6} md={4} key={truck._id}>
            <Card>
                <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                    {truck.category}
                    </Typography>
                    <IconButton
                     color="primary"
                     aria-label="view items"
                    onClick={() => handleViewItems(truck.category)}
                    >
                    <ArrowForwardIcon />
                    </IconButton>
                </Box>
                </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={4} display="flex" justifyContent="center">
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleEditDefaultItems}
        >
          Edit Default Truck Items
        </Button>
      </Box>
    </Box>
  );
};

export default TruckStockPage;