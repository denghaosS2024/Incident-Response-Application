import { Person2Outlined, PlayArrowRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

interface ActiveAppointmentProps {
  patientName: string;
  issueName: string;
  startHour: number;
  severityIndex: number;
}

// Convert severityIndex to string label
const getSeverityLabel = (severityIndex: number): string => {
  return severityIndex === 0
    ? "Low"
    : severityIndex === 1
      ? "Medium"
      : severityIndex === 2
        ? "High"
        : "Urgent";
};

const ActiveAppointment: React.FC<ActiveAppointmentProps> = ({
  patientName,
  issueName,
  startHour,
  severityIndex,
}) => {
  return (
    <Box display="flex">
      <Box>
        <Person2Outlined fontSize="small" />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight="bold">
          {/* Patient Name */}
          {patientName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Issue Name */}
          {/* Original Issue: Breast Pain from car crash */}
          Issue: {issueName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Appointment Time */}
          {/* Time: 7PM Today */}
          Time: {startHour}:00
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* Severity Index */}
          {/* Priority: High */}
          Priority: {getSeverityLabel(severityIndex)}
        </Typography>
      </Box>
      <Box>
        <PlayArrowRounded fontSize="small" />
      </Box>
    </Box>
  );
};

export default ActiveAppointment;
