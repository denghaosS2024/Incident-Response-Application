import { IAppointment } from "@/models/Appointment";
import request from "@/utils/request";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import React, { useState } from "react";
interface AppointmentFormProps {
  userId: string;
  startHour: number;
  endHour: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  userId,
  startHour,
  endHour,
}) => {
  const severityList: string[] = ["Low", "Medium", "High", "Emergency"];
  const [issueName, setIssueName] = useState<string>("");
  const [severityIndex, setSeverityIndex] = useState<number>(-1);

  return (
    <>
      <Box display="flex" justifyContent="center" paddingTop={2}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          paddingX="32px"
        >
          <Box width="100%" maxWidth="500px" my={2}>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "16px",
                padding: "16px",
                backgroundColor: "#1976d2",
                color: "white",
                textAlign: "center",
              }}
            >
              You selected session: {startHour}:00 -- {endHour}:00
            </Box>
          </Box>
          {/**Asks the user for Original Issue */}
          <Box width="100%" maxWidth="500px" my={2}>
            <FormControl fullWidth>
              <TextField
                variant="outlined"
                label="Original Issue"
                fullWidth
                value={issueName}
                onChange={(e) => {
                  setIssueName(e.target.value);
                }}
              />
            </FormControl>
          </Box>

          {/**Asks the user for Severity Level */}
          <Box width="100%" maxWidth="500px" my={2}>
            <FormControl fullWidth>
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                id="severity-select"
                labelId="severity-label"
                label="Severity"
                value={severityIndex}
                fullWidth
                onChange={(e) => {
                  setSeverityIndex(Number(e.target.value));
                }}
              >
                <MenuItem key="-1" value="-1">
                  Select One
                </MenuItem>
                {severityList.map((elem: string, index: number) => (
                  <MenuItem key={index} value={index}>
                    {elem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box width="100%" maxWidth="500px" my={2}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={async () => {
                const appointmentData: IAppointment = {
                  userId,
                  issueName,
                  isResolved: false,
                  severityIndex,
                  // startHour,
                  // endHour,
                };
                try {
                  const appointments = await request(`/api/appointments`, {
                    method: "POST",
                    body: JSON.stringify(appointmentData),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (appointments) {
                    window.location.href = "/appointments";
                  }
                } catch (error) {
                  console.error("Error sending request:", error);
                }
              }}
            >
              Looks Good!
            </button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AppointmentForm;
