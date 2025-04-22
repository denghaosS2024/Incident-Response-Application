import request from "@/utils/request";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExerciseItem from "../components/Exercise/ExerciseItem";
import { IExercise } from "../models/Exercise";

const ExerciseLibraryPage = () => {
  const currentUserId = localStorage.getItem("uid") ?? "";
  const [exerciseList, setExerciseList] = useState<IExercise[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseList = async () => {
      if (!currentUserId) return;

      try {
        const exerciseList = await request(
          `/api/exercises/user/${currentUserId}`,
          {
            method: "GET",
          },
        );

        setExerciseList(exerciseList);
      } catch (error) {
        console.error("Failed to fetch exercise list:", error);
      }
    };

    fetchExerciseList();
  }, []);

  const handleDelete = async () => {
    if (!selectedExerciseId) return;
    setExerciseList((prevList) =>
      prevList.filter((exercise) => exercise._id !== selectedExerciseId),
    );
    try {
      const response = await request(`/api/exercises/${selectedExerciseId}`, {
        method: "DELETE",
      });
      console.log(" delete response:", response);
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    } finally {
      setSelectedExerciseId(null);
      setOpenConfirmDialog(false);
    }
  };

  const openDialog = (id: string) => {
    setOpenConfirmDialog(true);
    setSelectedExerciseId(id);
  };

  const handleView = (exercise: IExercise) => {
    // Handle view logic here
    console.log("Viewing exercise:", exercise);
  };

  const handleAddExercise = () => {
    // Handle add exercise logic here
    navigate(`/exercise-library/${currentUserId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Stack spacing={1}>
        {exerciseList.length > 0 ? (
          exerciseList.map((exercise, idx) => (
            <ExerciseItem
              key={idx}
              exercise={exercise}
              onDelete={openDialog}
              onView={handleView}
            />
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ color: "gray", mt: 4, mb: 2, textAlign: "center" }}
          >
            No exercises found. Click + to add a new one!
          </Typography>
        )}
      </Stack>

      <ConfirmationDialog
        open={openConfirmDialog}
        title="Delete Group"
        description="Are you sure you want to delete this group?"
        onConfirm={handleDelete}
        onCancel={() => setOpenConfirmDialog(false)}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: 4,
          alignSelf: "center",
          width: 50,
          height: 50,
          minWidth: 0,
          borderRadius: "8px",
          padding: 0,
        }}
        onClick={handleAddExercise}
      >
        <AddIcon />
      </Button>
    </Box>
  );
};
export default ExerciseLibraryPage;
