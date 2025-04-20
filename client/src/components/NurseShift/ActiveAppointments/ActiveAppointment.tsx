import { Person2Outlined, PlayArrowRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

const ActiveAppointment = () => {
  return (
    <Box display="flex">
      <Box>
        <Person2Outlined fontSize="small" />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight="bold">
          {/* Patient Name */}
          John Doe
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Issue Name */}
          Original Issue: Breast Pain from car crash
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Appointment Time */}
          Time: 7PM Today
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Severity Index */}
          Priority: High
        </Typography>
      </Box>
      <Box>
        <PlayArrowRounded fontSize="small" />
      </Box>
    </Box>
  );
};

export default ActiveAppointment;
