import { Box } from "@mui/material";
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

  useEffect(() => {
    // Fetch inventory data from the server using the truckName
    const fetchInventory = async () => {
      try {
        const response = await request(
          `/api/inventories/category/${truckName}`,
        );
        setInventoryItems(response);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, [truckName]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="10vh"
      padding="16px"
    >
      {/* <Typography variant="h4" gutterBottom>
        Inventory for Truck: {truckName}
      </Typography> */}
      <Box>
        {inventory.items.map((item, index) => (
          <InventoryItem
            key={index}
            name={item.name}
            description={item.description || ""}
            quantity={item.quantity}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TruckInventoryPage;
