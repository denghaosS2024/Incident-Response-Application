import {
    Box,
    Button,
    Paper,
    TextField
} from "@mui/material";

const HospitalResourceForm: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      {/* Resource name*/}
      <TextField
        label="Name"
        fullWidth
        margin="normal"
      />
      {/* Quantity */}
      <TextField
        label="Quantity"
        fullWidth
        type="number"
        margin="normal"
        InputProps={{
          inputProps: {
            inputMode: "numeric", // Forces numeric keyboard on iOS
            pattern: "[0-9]*", // Ensures only numbers are entered
            max: 110,
            min: 1,
          },
        }}
      />
       {/* Stock Alert Threshold */}
       <TextField
        label="Stock Alert Threshold"
        fullWidth
        type="number"
        margin="normal"
        InputProps={{
          inputProps: {
            inputMode: "numeric", // Forces numeric keyboard on iOS
            pattern: "[0-9]*", // Ensures only numbers are entered
            max: 110,
            min: 1,
          },
        }}
      />
      {/* Buttons to submit, cancel or delete */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary">
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default HospitalResourceForm;
