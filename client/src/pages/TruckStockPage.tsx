import { FireTruck as FireTruckIcon } from "@mui/icons-material";
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
import { Truck } from "./Organization";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  description: string;
}

interface TruckInventory {
  _id: string;
  category: string;
  items: InventoryItem[];
}




const TruckStockPage: React.FC = () => {
  const [trucks, setTrucks] = useState<TruckInventory[]>([]);
  const [truckData, setTruckData] = useState<Truck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [inventoryData, trucksData] = await Promise.all([
          request('/api/inventories/non-default'),
          request<Truck[]>("/api/trucks/list/all"),
        ]);
        console.log('Inventory Data:', inventoryData);
        console.log('Trucks Data:', trucksData);
        
        if (Array.isArray(inventoryData)) {
          setTrucks(inventoryData);
        } else {
          console.error('Unexpected inventory API response format:', inventoryData);
          setTrucks([]);
        }
        
        // Process truck data
        if (Array.isArray(trucksData)) {
          setTruckData(trucksData);
        } else if (trucksData && Array.isArray(trucksData)) {
          setTruckData(trucksData);
        } else {
          console.error('Unexpected truck API response format:', trucksData);
          setTruckData([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIncidentName = (truckCategory: string): string => {
    // Find the truck with the matching name/category
    const truck = truckData.find(t => t.name === truckCategory);
    
    // Return the incident name if available, otherwise return default text
    return truck?.assignedIncident || "No active incident";
  };

  const handleViewItems = (category: string): void => {
    navigate(`/truck-inventory/${category}`);
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
                  <FireTruckIcon />
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
                <Box mt={1}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Incident:</strong> {getIncidentName(truck.category)}
                  </Typography>
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