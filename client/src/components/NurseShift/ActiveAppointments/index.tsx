import { Box, Typography } from "@mui/material";
import ActiveAppointment from "./ActiveAppointment";

const ActiveAppointments = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Active Appointments
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <ActiveAppointment />
        <ActiveAppointment />
        <ActiveAppointment />
      </Box>
    </Box>
  );
};

export default ActiveAppointments;
