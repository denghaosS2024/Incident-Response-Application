import AppointmentForm from "@/components/feature/ScheduleAppointment/AppointmentForm";
import { Box } from "@mui/material";
import React from "react";
import { useSearchParams } from "react-router";

const YourAppointmentPage: React.FC = () => {
  const userId = localStorage.getItem("uid") ?? "";
  const [searchParams] = useSearchParams();
  const startHour = searchParams.get("startHour");
  const endHour = searchParams.get("endHour");

  return (
    <Box sx={{ height: "100%" }}>
      <AppointmentForm
        userId={userId}
        startHour={Number(startHour)}
        endHour={Number(endHour)}
      ></AppointmentForm>
    </Box>
  );
};

export default YourAppointmentPage;
