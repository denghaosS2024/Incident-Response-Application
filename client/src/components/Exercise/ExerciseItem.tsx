import { IExercise } from "@/models/Exercise";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";

interface ExerciseItemProps {
  exercise: IExercise;
  onDelete: (id: string) => void;
  onView: (exercise: IExercise) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onDelete,
  onView,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid black",
        padding: "10px",
        marginBottom: "5px",
        width: "300px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={() => onDelete(exercise._id)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
        <Typography variant="body1">{exercise.name}</Typography>
      </Box>

      <IconButton onClick={() => onView(exercise)} size="small">
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default ExerciseItem;
