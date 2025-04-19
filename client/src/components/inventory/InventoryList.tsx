import React from "react";
import { Typography, Box, List } from "@mui/material";
import {InventoryItem} from "./InventoryItem";

interface Inventory {
  items: InventoryItem[];
}

const InventoryList: React.FC<Inventory> = ({ items }) => {
  return (
    <Box>
      <Typography variant="h6" style={{ marginTop: 16 }}>
        Inventory
      </Typography>
      <Box display="flex" alignItems="center" mb={1}></Box>
      <List>
        {items.map((item, index) => (
          <InventoryItem
            key={index}
            name={item.name}
            description={item.description}
            quantity={item.quantity}
          />
        ))}
      </List>
    </Box>
  );
}
