import { NavigateNext as Arrow, Hardware } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import FlagIcon from "@mui/icons-material/Flag";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { IInventoryItem } from "../models/Inventory";
import DefaultTruckAddItem from "./DefaultTruckAddItem";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import request from "../utils/request";

const DefaultTruckInventory: React.FC = () => {
  const [defaultItems, setDefaultItems] = useState<IInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  const [updateInventory, setUpdateInventory] = useState<boolean>(false); // Dependency to trigger updates

  const handleArrowClick = (item: IInventoryItem) => {
    setSelectedItem(item); // no navigation
  };

  const handleCloseAddItem = () => {
    setSelectedItem(null); // go back to main view
  };
  const handleRemoveItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await request("/api/inventories/deleteitem", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: selectedItem.name }),
      });
      alert("Successfully deleted!");
      setUpdateInventory((prev) => !prev); // Toggle to trigger the effect
      setSelectedItem(null); // go back to main view
    } catch (error) {
      console.error("Error removing item:", error);
      setLoading(false);
    }
  };

  const handleSubmitItem = async (data: IInventoryItem) => {
    try {
      await request("/api/inventories/default/item", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setUpdateInventory((prev) => !prev); // Toggle to trigger the effect

      setSelectedItem(null); // Hide the form
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  useEffect(() => {
    const fetchDefaultInventory = async (): Promise<void> => {
      try {
        const data = await request("/api/inventories/category/default");

        if (data) {
          console.log(data);
          setDefaultItems(data.items);
        } else {
          console.error("Unexpected API response format:", data);
          setDefaultItems([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };

    fetchDefaultInventory();
  }, [updateInventory]);

  const getIconForName = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "Medical Kit": <MedicalServicesIcon />,
      "Repair Tools": <HomeRepairServiceIcon />,
      Hardware: <Hardware />,
      Flag: <FlagIcon />,
    };

    return iconMap[name] || <AddPhotoAlternateIcon />;
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
      {selectedItem ? (
        <DefaultTruckAddItem
          item={selectedItem}
          onSubmit={handleSubmitItem}
          onCancel={handleCloseAddItem}
          onDelete={handleRemoveItem}
        />
      ) : (
        <>
          {" "}
          <Grid container spacing={2}>
            {defaultItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1 }}>
                          {getIconForName(item.icon)}
                        </Avatar>
                        <Typography variant="h6">{item.name}</Typography>
                      </Box>
                      <IconButton
                        edge="end"
                        size="large"
                        onClick={() => handleArrowClick(item)}
                      >
                        <Arrow />
                      </IconButton>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
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
            onClick={() =>
              setSelectedItem({
                name: "",
                quantity: 0,
                icon: "",
                description: "",
                _id: "",
              })
            }
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
        </>
      )}
    </Box>
  );
};

export default DefaultTruckInventory;
