import { IAppointment } from "@/models/Appointment";
import request from "@/utils/request";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ActiveAppointment from "./ActiveAppointment";

const ActiveAppointments = () => {
  const [activeAppointments, setActiveAppointments] = useState<IAppointment[]>(
    [],
  );

  // use the citizenid as the nurseId, according to the team meeting
  const nurseId = localStorage.getItem("uid");
  console.log("Nurse ID:", nurseId);
  const fetchActiveAppointmentsInCurrentShiftHour = async () => {
    try {
      const response = await request(
        `/api/appointments/status/active?nurseId=${nurseId}`,
        {
          method: "GET",
        },
      );
      console.log("Active appointments in current shift hour:", response);
      setActiveAppointments(response);
    } catch (error) {
      console.error("Failed to fetch active appointments:", error);
    }
  };

  useEffect(() => {
    fetchActiveAppointmentsInCurrentShiftHour();
  }, []);

  return (
    <Box mt={2}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 2, paddingX: "4px" }}
      >
        Active Appointments
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {activeAppointments.map((appointment) => (
          <ActiveAppointment
            key={appointment._id}
            appointmentld={appointment._id || ""}
            patientName={appointment.username}
            issueName={appointment.issueName}
            startHour={appointment.startHour}
            severityIndex={appointment.severityIndex}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ActiveAppointments;
