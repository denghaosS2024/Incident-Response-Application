// pages/AppointmentSchedulerPage.tsx

import AppointmentSlotSelector, {
  Slot,
} from "@/components/NurseShift/ActiveAppointments/AppointmentSlotSelector";
import request from "@/utils/request";
import { Box, Button, CircularProgress, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function AppointmentSchedulerPage() {
  const userId = localStorage.getItem("uid") ?? "";
  const [loading, setLoading] = useState(true);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [currentAppointment, setCurrentAppointment] = useState<any | null>(
    null,
  );
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const now = new Date();
  const today = now.getDay(); // 0 (Sun) - 6 (Sat)

  const formatDay = (slotDay: number): string => {
    const diff = (slotDay - 1 - today + 7) % 7;
    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    if (slotDay < today) return `next ${dayNames[slotDay]}`;
    return dayNames[slotDay];
  };

  useEffect(() => {
    const fetchStatusAndSlots = async () => {
      try {
        const statusRes = await request(
          `/api/appointments/user/${userId}/active`,
        );
        setHasAppointment(statusRes.hasAppointment);

        if (statusRes.hasAppointment) {
          const res = await request(
            `/api/appointments/user/${userId}/active-one`,
          );
          setCurrentAppointment(res);
        } else {
          const slotRes = await request("/api/appointments/slots/next6");
          setSlots(slotRes);
        }
      } catch (error) {
        console.error("Failed to fetch appointment info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusAndSlots();
  }, [userId]);

  const navigate = useNavigate();

  const handleCancel = async () => {
    try {
      await request(`/api/appointments/user/${userId}/active`, {
        method: "DELETE",
      });
      setHasAppointment(false);
      setCurrentAppointment(null);

      const slotRes = await request("/api/appointments/slots/next6");
      setSlots(slotRes);
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  const handleSubmit = () => {
    if (!selected) return;

    const { startHour, endHour, nurseId, dayOfWeek } = selected;
    navigate(
      `/your-appointment?startHour=${startHour}&endHour=${endHour}&dayOfWeek=${dayOfWeek}`,
    );
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box
      sx={{
        maxWidth: "600px",
        marginX: "auto",
        paddingX: "1.5rem",
        paddingTop: "1rem",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: "#1976d2",
          color: "white",
          textAlign: "center",
          mb: 2,
          fontSize: "0.8rem",
        }}
      >
        {hasAppointment ? (
          <>
            Your selected session:{" "}
            {currentAppointment
              ? `${currentAppointment.startHour
                  .toString()
                  .padStart(2, "0")}:00 -- ${currentAppointment.endHour
                  .toString()
                  .padStart(
                    2,
                    "0",
                  )}:00 on ${formatDay(currentAppointment.dayOfWeek)}`
              : "Loading..."}
            <Box mt={1}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleCancel}
                sx={{ fontSize: "0.8rem" }}
              >
                Cancel your current appointment
              </Button>
            </Box>
          </>
        ) : (
          "You have no current appointment"
        )}
      </Paper>

      <AppointmentSlotSelector
        slots={slots}
        selected={selected}
        disabled={hasAppointment}
        onSelect={setSelected}
      />

      <Box mt={4}>
        <Button fullWidth variant="contained" sx={{ mb: 2 }}>
          Review your past appointments
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
