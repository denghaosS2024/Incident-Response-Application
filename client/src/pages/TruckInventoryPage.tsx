import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import InventoryItem from "../components/inventory/InventoryItem";
import IInventory from "../models/Inventory.ts";
import request from "../utils/request";

const TruckInventoryPage: React.FC = () => {
  const { truckName } = useParams<{ truckName: string }>();
  const [inventory, setInventoryItems] = useState<IInventory>({
    category: "",
    items: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch inventory data from the server using the truckName
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await request(
          `/api/inventories/category/${truckName}`,
        );
        // console.log("Inventory Data:", response);
        setInventoryItems(response);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [truckName]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {truckName} Inventory
      </Typography>
      
      <Grid container spacing={2}>
        {inventory.items.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <InventoryItem item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TruckInventoryPage;