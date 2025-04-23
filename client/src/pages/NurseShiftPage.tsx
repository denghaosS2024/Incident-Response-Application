import ActiveAppointments from "@/components/NurseShift/ActiveAppointments";
import NurseShiftStatus from "@/components/NurseShift/NurseShiftStatus";
import { ArrowForwardIos } from "@mui/icons-material";
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
        paddingX: "16px",
        paddingTop: "16px",
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Don't leave your patients behind!
      </Typography>

      <NurseShiftStatus />

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          endIcon={<ArrowForwardIos sx={{ fontSize: 18, marginLeft: 1 }} />}
          sx={{
            maxWidth: "100%",
            textTransform: "none",
            py: 1.5,
            borderRadius: 2,
            boxShadow: 1,
            justifyContent: "space-between",
            padding: "12px 20px", // Increased horizontal padding
          }}
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
