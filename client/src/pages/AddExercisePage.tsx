import AlertSnackbar from "@/components/common/AlertSnackbar";
import {
  AlertColor,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExerciseBlockField from "../components/Exercise/ExerciseBlockField";
import { IExerciseBlock } from "../models/Exercise";
import request from "../utils/request";

const conditionOptions = [
  "Stroke",
  "Joint Surgery",
  "Fracture Recovery",
  "Musculoskeletal Pain",
  "Chronic Disease Management",
  "General Mobility Decline",
  "Deconditioning",
  "Post-surgical Recovery",
  "Diabetic Foot Care",
];

const recoveryStageOptions = ["Early Stage", "Mid Stage", "Late Stage"];

const bodyRegionOptions = [
  "Upper Body",
  "Lower Body",
  "Core/Trunk",
  "Full Body",
  "Not Specific",
];

export default function AddExercisePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [templateName, setTemplateName] = React.useState("");
  const [condition, setCondition] = useState("");
  const [recoveryStage, setRecoveryStage] = useState("");
  const [bodyRegion, setBodyRegion] = useState("");
  const [blocks, setBlocks] = useState<IExerciseBlock[]>([]);
  const [hasAnyBlockError, setHasAnyBlockError] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  const handleValidationChange = (hasError: boolean) => {
    setHasAnyBlockError(hasError);
  };

  const handleSubmit = async () => {
    const finalUserId = userId ?? localStorage.getItem("uid");
    if (!finalUserId) {
      console.error("No userId available.");
      setAlertMessage("User ID is missing.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    const exerciseData = {
      userId: finalUserId,
      name: templateName,
      condition,
      recoveryStage,
      bodyRegion,
      blocks,
    };
    try {
      const response = await request(`/api/exercises/`, {
        method: "POST",
        body: JSON.stringify(exerciseData),
      });

      if (response) {
        setAlertMessage("Exercise template saved successfully!");
        setAlertSeverity("success");
        setAlertOpen(true);

        // Reset the form after submission
        setTemplateName("");
        setCondition("");
        setRecoveryStage("");
        setBodyRegion("");
        setBlocks([]);
      } else {
        console.error("Failed to save exercise template");
        setAlertMessage("Failed to save exercise template.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error saving exercise template:", error);
      setAlertMessage("An unexpected error occurred.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setAlertOpen(false);
    if (alertSeverity === "success") {
      // Redirect to the exercise library page after successful save
      navigate("/exercise-library");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, mb: 4, p: 2 }}>
      <TextField
        label="Exercise Name"
        variant="outlined"
        fullWidth
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
      />

      {/* Condition */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Condition:
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          row
        >
          <Stack className="pl-4" direction="row" flexWrap="wrap">
            {conditionOptions.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option}
                sx={{ width: "45%" }}
              />
            ))}
          </Stack>
        </RadioGroup>
      </FormControl>

      {/* Recovery */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Recovery:
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={recoveryStage}
          onChange={(e) => setRecoveryStage(e.target.value)}
        >
          {recoveryStageOptions.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Body Region */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Body Region:
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={bodyRegion}
          onChange={(e) => setBodyRegion(e.target.value)}
        >
          {bodyRegionOptions.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Exercise Block */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Exercise Block:
      </Typography>
      <ExerciseBlockField
        blockList={blocks}
        setBlockList={setBlocks}
        onValidationChange={handleValidationChange}
      />

      {/* Save Button */}
      <Stack direction="row" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            !templateName ||
            !condition ||
            !recoveryStage ||
            !bodyRegion ||
            blocks.length === 0 ||
            hasAnyBlockError
          }
        >
          Save
        </Button>
      </Stack>
      <AlertSnackbar
        open={alertOpen}
        message={alertMessage}
        severity={alertSeverity}
        onClose={handleSnackbarClose}
        autoHideDuration={1000}
      />
    </Box>
  );
}
