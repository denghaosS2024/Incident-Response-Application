import { Box, Typography } from "@mui/material";
import React from "react";

type StarRatingProps = {
  label: string;
  rating: number;
  onChange?: (rating: number) => void;
  icon?: string;
};

const StarRating: React.FC<StarRatingProps> = ({ label, rating, onChange, icon }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={1}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon && (
          <Typography sx={{ color: "#d62828", fontWeight: 500 }}>
            {icon}
          </Typography>
        )}
        <Typography>{label}</Typography>
      </Box>

      <Box display="flex" gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Typography
            key={star}
            onClick={() => onChange?.(star)}
            sx={{
              cursor: onChange ? "pointer" : "default",
              color: star <= rating ? "#FFD700" : "#ddd",
              fontSize: "20px",
              userSelect: "none",
            }}
          >
            {star <= rating ? "★" : "☆"}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default StarRating;
