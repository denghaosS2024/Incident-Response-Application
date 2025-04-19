import React from "react";
import { useParams } from "react-router";
import { Box, Typography } from "@mui/material";
import InventoryItem from "../components/inventory/InventoryItem";

const TruckInventoryPage: React.FC = () => {
  const { truckName } = useParams<{ truckName: string }>();

  // Mock inventory data
  const mockInventory = [
    { name: "Medical Kit", description: "First aid supplies", quantity: 5 },
    { name: "Repair Tools", description: "Tools for vehicle repair", quantity: 3 },
    { name: "Emergency", description: "Emergency response equipment", quantity: 2 },
  ];

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
        {mockInventory.map((item, index) => (
          <InventoryItem
            key={index}
            name={item.name}
            description={item.description}
            quantity={item.quantity}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TruckInventoryPage;
