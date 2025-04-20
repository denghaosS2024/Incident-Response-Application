import request from "@/utils/request";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const NurseShiftStatus: React.FC = () => {
  const [onShift, setOnShift] = useState<boolean | null>(null);
  const userId = localStorage.getItem("uid");

  useEffect(() => {
    const fetchShiftStatus = async () => {
      try {
        const response = await request(`/api/nurse-shifts/${userId}/on-shift`, {
          method: "GET",
        });

        const normalized = String(response.onShift).toLowerCase() === "true";
        console.log("Normalized shift status:", normalized);
        setOnShift(normalized);
      } catch (error) {
        console.error("Failed to fetch shift status:", error);
        setOnShift(null);
      }
    };

    fetchShiftStatus();
  }, [userId]);

  let displayText = "Loading shift status...";
  let displayColor = "black";

  if (onShift === true) {
    console.log("onshift status:", onShift);
    displayText = "You are on shift now";
    displayColor = "red";
  } else if (onShift === false) {
    const now = new Date();
    console.log("[DEBUG] Now:", now.toISOString());
    console.log("[DEBUG] Hour:", now.getHours());
    console.log("[DEBUG] Day:", now.getDay());

    console.log("onshift status:", onShift);
    displayText = "You are not on shift now";
    displayColor = "green";
  }

  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: displayColor,
          fontSize: "20px",
        }}
      >
        {displayText}
      </Typography>
    </Box>
  );
};

export default NurseShiftStatus;
