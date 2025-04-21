import { IAppointment } from "@/models/Appointment";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import request from "../utils/request";

const NurseAppointmentInfoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId") ?? "";
  const [appointmentInfo, setAppointmentInfo] = useState<IAppointment>();
  const severityList: string[] = ["Low", "Medium", "High", "Emergency"];
  const [severityIndex, setSeverityIndex] = useState<number>(-1);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    async function fetchAppointmentInfo() {
      try {
        const data: IAppointment = await request<IAppointment>(
          `/api/appointments/${appointmentId}`,
          { method: "GET" },
        );
        setAppointmentInfo(data);
        setSeverityIndex(data.severityIndex);
        setNote(data.note ?? "");
      } catch (error) {
        console.error("Error fetching appointment info:", error);
      }
    }

    fetchAppointmentInfo();
  }, []);

  async function handleUpdateAppointment() {
    try {
      await request(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({
          note,
          severityIndex,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Appointment updated successfully.");
    } catch (error) {
      console.error("Failed to update appointment:", error);
      alert("Failed to update appointment.");
    }
  }

  return (
    appointmentInfo && (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        paddingX="32px"
        paddingTop={2}
      >
        <Box className="h-full mt-4">
          <Typography variant="h4">{appointmentInfo?.username}</Typography>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl fullWidth>
            <TextField
              variant="outlined"
              label="Original Issue"
              fullWidth
              value={appointmentInfo?.issueName}
              InputProps={{ readOnly: true }}
            />
          </FormControl>
        </Box>

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

        <Box className="w-full max-w-[500px] my-4 p-4 rounded-md border border-gray-300 shadow-sm bg-white">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Appointment Time
          </Typography>
          <Typography variant="body1" className="text-gray-700">
            <strong>Day:</strong>{" "}
            {
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][appointmentInfo.dayOfWeek]
            }
          </Typography>
          <Typography variant="body1" className="text-gray-700">
            <strong>Time:</strong> {appointmentInfo.startHour}:00 –{" "}
            {appointmentInfo.endHour}:00
          </Typography>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl fullWidth>
            <TextField
              variant="outlined"
              label="Nurse Notes"
              multiline
              minRows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
            onClick={handleUpdateAppointment}
          >
            Update Appointment Information
          </button>
        </Box>
        <Box width="100%" maxWidth="500px" my={4}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Actions
          </Typography>

          <Box display="flex" gap={2}>
            <button
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await request(`/api/appointments/${appointmentId}/resolve`, {
                    method: "PUT",
                  });
                  alert("Appointment marked as resolved.");
                } catch (error) {
                  console.error("Failed to mark as resolved:", error);
                  alert("Failed to mark appointment as resolved.");
                }
              }}
            >
              Mark As Resolved
            </button>

            <button
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "white",
                color: "#1976d2",
                border: "1px solid #1976d2",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              // TODO: Navigate to past records page
              onClick={() => {
                navigate(
                  `/past-appointment?userId=${encodeURIComponent(appointmentInfo.userId)}`,
                );
              }}
            >
              Past Records
            </button>
          </Box>
        </Box>
      </Box>
    )
  );
};

export default NurseAppointmentInfoPage;
