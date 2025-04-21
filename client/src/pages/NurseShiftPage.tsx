import ActiveAppointments from "@/components/NurseShift/ActiveAppointments";
import NurseShiftStatus from "@/components/NurseShift/NurseShiftStatus";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export default function NurseShiftPage() {
  const navigate = useNavigate();

  const handleMyShiftsClick = () => {
    navigate("/shifts/mine");
  };

  return (
    <Box
      sx={{
        maxWidth: "600px",
        marginX: "auto",
        paddingX: "1.5rem",
        paddingTop: "1rem",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Nurse Shifts
      </Typography>

      <Typography variant="body1" color="textSecondary">
        Don't leave your patients behind!
      </Typography>

      <NurseShiftStatus />

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ maxWidth: 300 }}
          onClick={handleMyShiftsClick}
        >
          My Shifts
        </Button>
      </Box>

      <Box mt={4}>
        <ActiveAppointments />
      </Box>
    </Box>
  );
}
