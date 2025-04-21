import { IAppointment, SeverityIndex } from "@/models/Appointment";
import request from "@/utils/request";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import React, { useState } from "react";
interface AppointmentFormProps {
  userId: string;
  startHour: number;
  endHour: number;
  dayOfWeek: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  userId,
  startHour,
  endHour,
  dayOfWeek,
}) => {
  const severityList: string[] = ["Low", "Medium", "High", "Emergency"];
  const username: string = localStorage.getItem("username");
  const [issueName, setIssueName] = useState<string>("");
  const [severityIndex, setSeverityIndex] = useState<number>(-1);
  const dayOfWeekMap: { [key: string]: number } = {
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formatDay = (slotDay: number): string => {
    const today = new Date().getDay();
    const diff = (slotDay - today + 7) % 7;

    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    if (slotDay < today) return `next ${dayNames[slotDay]}`;
    return dayNames[slotDay];
  };

  const confirmAppointment = async () => {
    if (severityIndex === -1) {
      alert("Please select a valid severity level.");
      return;
    }

    if (!issueName.trim()) {
      alert("Issue name cannot be empty.");
      return;
    }
    const appointmentData: IAppointment = {
      userId,
      issueName,
      isResolved: false,
      severityIndex: severityIndex as SeverityIndex,
      startHour,
      endHour,
      nurseId: undefined,
      createDate: new Date(),
      updateDate: new Date(),
      note: "",
      closedDate: undefined,
      dayOfWeek:
        dayOfWeekMap[new Date().toLocaleString("en-US", { weekday: "long" })],
      feedback: undefined,
      valid: true,
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
  };

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
              display="flex"
              justifyContent="center"
              alignItems="center"
              my={2}
            >
              <Typography variant="h3" component="div" fontWeight="bold">
                {username}
              </Typography>
            </Box>
          </Box>
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
              You selected session: {startHour}:00 -- {endHour}:00 on{" "}
              {formatDay(dayOfWeek)}
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
              onClick={confirmAppointment}
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
