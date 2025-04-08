import { Box, Paper, Typography } from "@mui/material";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import IMessage from "../models/Message";
import IUser from "../models/User";
import { selectCurrentHospitalId } from "../redux/userHospitalSlice";
import styles from "../styles/Message.module.css";
import getRoleIcon from "./common/RoleIcon";

interface NurseAlertMessageProps {
  message: IMessage;
}

const parseAlertContent = (content: string) => {
  // Handle both new and old message formats
  console.log("Parsing alert content:", content);

  // Extract alert type (E, U, or regular HELP)
  let alertType = "HELP";
  if (content.includes("E HELP")) {
    alertType = "E HELP";
  } else if (content.includes("U HELP")) {
    alertType = "U HELP";
  }

  // Handle both formats for patient name extraction
  let patientName = "";
  let nursesNeeded = 1;

  // Try the new format first: "HELP - Patient: PatientName - Nurses: X" or "E HELP - Patient: PatientName - Nurses: X"
  const patientMatch = content.match(/Patient:\s*([^-]+)/);
  if (patientMatch && patientMatch[1]) {
    patientName = patientMatch[1].trim();

    // Try to extract nurses count from new format
    const nursesMatch = content.match(/Nurses:\s*(\d+)/);
    if (nursesMatch && nursesMatch[1]) {
      nursesNeeded = parseInt(nursesMatch[1], 10);
    }
  } else {
    // Try the old format: "E HELP-PatientName-X" or legacy format with dashes
    const parts = content.split("-");
    if (parts.length > 1) {
      patientName = parts[1].trim();
      if (parts.length > 2 && !isNaN(parseInt(parts[2]))) {
        nursesNeeded = parseInt(parts[2]);
      }
    }
  }

  console.log("Parsed content:", { alertType, patientName, nursesNeeded });

  return {
    alertType,
    patientName,
    nursesNeeded,
  };
};

const NurseAlertMessage: React.FC<NurseAlertMessageProps> = ({ message }) => {
  // Message display component using the red card design from the prototype
  const { content, acknowledgedBy = [] } = message;

  // Get current hospital ID from Redux
  const currentHospitalId = useSelector(selectCurrentHospitalId);

  // Extract responders
  const responders = message.responders || [];

  // Parse alert content
  const { alertType, patientName } = parseAlertContent(content);

  // Determine background color by alert type
  let bgColor = "#2196F3"; // Default blue for HELP
  if (alertType === "E HELP") {
    bgColor = "#f44336"; // Red
  } else if (alertType === "U HELP") {
    bgColor = "#ff9800"; // Orange
  }

  console.log(
    "Alert type:",
    alertType,
    "Content:",
    content,
    "Bg color:",
    bgColor,
  );

  // Group responders by status
  const groupRespondersByStatus = () => {
    if (!responders || !Array.isArray(responders) || responders.length === 0) {
      return { notAcknowledged: [], accepted: [], busy: [] };
    }

    const notAcknowledged: IUser[] = [];
    const accepted: { user: IUser; timestamp?: string }[] = [];
    const busy: { user: IUser; timestamp?: string }[] = [];

    // First filter to only include nurse responders
    let nurseResponders = responders.filter(
      (responder) => responder && responder.role === "Nurse",
    );

    console.log(
      "All nurse responders before hospital filtering:",
      nurseResponders.length,
    );

    // Then filter by hospital if a hospital ID is available
    if (currentHospitalId) {
      // Keep track of the original count for debugging
      const originalCount = nurseResponders.length;

      // Apply hospital filter
      nurseResponders = nurseResponders.filter(
        (responder) => responder.hospitalId === currentHospitalId,
      );

      console.log(
        `Filtered nurses by hospital (${currentHospitalId}): ${nurseResponders.length} of ${originalCount}`,
      );

      // If all nurses were filtered out, revert to showing all nurses
      if (nurseResponders.length === 0 && originalCount > 0) {
        console.log("All nurses filtered out, showing all nurses instead");
        nurseResponders = responders.filter(
          (responder) => responder && responder.role === "Nurse",
        );
      }
    } else {
      console.log("No hospital ID available, showing all nurses");
    }

    console.log(
      `Filtered nurses by hospital (${currentHospitalId}):`,
      nurseResponders.length,
    );

    // Process each nurse responder
    nurseResponders.forEach((responder) => {
      // Check if this nurse has acknowledged the alert
      const index = acknowledgedBy.findIndex(
        (user: IUser) => user._id === responder._id,
      );

      if (index === -1) {
        // Not acknowledged - add to that list
        notAcknowledged.push(responder);
        return;
      }

      // Check if the response is 'busy' or 'accepted' from the responses array
      const userResponse = message.responses?.find((response) => {
        const userId =
          typeof response.userId === "string"
            ? response.userId
            : response.userId._id;
        return userId === responder._id;
      });

      const isBusy = userResponse?.response?.toUpperCase() === "BUSY";

      if (isBusy) {
        busy.push({
          user: responder,
          timestamp: message.acknowledgedAt?.[index],
        });
      } else {
        accepted.push({
          user: responder,
          timestamp: message.acknowledgedAt?.[index],
        });
      }
    });

    return { notAcknowledged, accepted, busy };
  };

  const { notAcknowledged, accepted, busy } = groupRespondersByStatus();

  // Format timestamp for display
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return moment(timestamp).format("MM.DD.YY - HH:mm:ss");
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        border: "1px solid #000",
        overflow: "hidden",
        width: "100%",
        maxWidth: 500,
      }}
    >
      {/* Sender information */}
      <Box sx={{ p: 1, borderBottom: "1px solid #eee" }}>
        <Box display="flex" alignItems="center">
          {message.sender && getRoleIcon(message.sender.role)}
          <Typography variant="body1" className={styles.name}>
            {message.sender ? message.sender.username : "System"}
          </Typography>
          <Typography
            variant="caption"
            className={styles.timestamp}
            sx={{ ml: 1 }}
          >
            {message.timestamp
              ? formatTime(message.timestamp)
              : formatTime(new Date().toISOString())}
          </Typography>
        </Box>
      </Box>

      {/* Alert header */}
      <Box
        sx={{
          bgcolor: bgColor,
          color: "white",
          p: 1.5,
          textAlign: "center",
          borderBottom: "1px solid #000",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {alertType}
        </Typography>
        <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
          Patient: {patientName}
        </Typography>
      </Box>

      {/* Acknowledgment list */}
      <Box sx={{ p: 1 }}>
        {/* Not acknowledged nurses */}
        {notAcknowledged.length > 0 && (
          <Box sx={{ mb: 1.5, mt: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              Not acknowledged by:
            </Typography>
            {notAcknowledged.map((user) => (
              <Typography key={user._id} variant="body2" sx={{ mt: 0.5 }}>
                {user.username}
              </Typography>
            ))}
          </Box>
        )}

        {/* Busy nurses */}
        {busy.length > 0 && (
          <Box sx={{ mb: 1.5, mt: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              Busy:
            </Typography>
            {busy.map(({ user }) => (
              <Box key={user._id} sx={{ mt: 0.5 }}>
                <Typography variant="body2">{user.username}</Typography>
                {/* Timestamp removed as per request */}
              </Box>
            ))}
          </Box>
        )}

        {/* Accepted nurses */}
        {accepted.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              Accept:
            </Typography>
            {accepted.map(({ user }) => (
              <Box key={user._id} sx={{ mt: 0.5 }}>
                <Typography variant="body2">{user.username}</Typography>
                {/* Timestamp removed as per request */}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NurseAlertMessage;
