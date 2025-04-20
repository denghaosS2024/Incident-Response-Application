import PastAppointmentList from "@/components/feature/ScheduleAppointment/PastAppointmentList";
import { Box } from "@mui/material";
import React from "react";
import { useSearchParams } from "react-router";

const PastAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  return (
    <Box sx={{ height: "100%" }}>
      <PastAppointmentList userId={userId}></PastAppointmentList>
    </Box>
  );
};

export default PastAppointmentPage;
