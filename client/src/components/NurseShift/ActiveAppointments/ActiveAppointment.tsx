import { Person2Outlined, PlayArrowRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";

interface ActiveAppointmentProps {
  appointmentld: string; // _id of the appointment
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
  appointmentld,
  patientName,
  issueName,
  startHour,
  severityIndex,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the appointment details page
    navigate(`/nurse-appointment-info?appointmentId=${appointmentld}`);
  };

  // Format the time better
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const timeDisplay = `${formatTime(startHour)} Today`;

  return (
    <Box
      sx={{
        display: "flex",
        p: 0, // Remove default padding
        pt: 1.5,
        pb: 1.5,
        pl: 0.5,
        pr: 0.5,
        borderRadius: 1,
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        mb: 1,
        "&:hover": {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        },
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      <Box sx={{ mx: 2, mt: 0.5, display: "flex", alignItems: "flex-start" }}>
        <Person2Outlined fontSize="small" sx={{ color: "text.secondary" }} />
      </Box>
      <Box sx={{ flexGrow: 1, pr: 2 }}>
        <Typography
          variant="subtitle1"
          fontWeight="500"
          gutterBottom
          sx={{ mb: 0.5 }}
        >
          {patientName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, lineHeight: 1.4 }}
        >
          Original Issue: {issueName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, lineHeight: 1.4 }}
        >
          Time: {timeDisplay}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          Priority: {getSeverityLabel(severityIndex)}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
        <PlayArrowRounded
          sx={{
            color: "text.secondary",
            fontSize: 20,
          }}
        />
      </Box>
    </Box>
  );
};

export default ActiveAppointment;
