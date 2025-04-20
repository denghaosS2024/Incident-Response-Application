import { IAppointment } from "@/models/Appointment";
import request from "@/utils/request";
import { Box, Typography } from "@mui/material";

interface PastAppointmentListProps {
  userId: string;
}

import { useEffect, useState } from "react";
import PastAppointmentCard from "./PastAppointmentCard";

const PastAppointmentList: React.FC<PastAppointmentListProps> = ({
  userId,
}) => {
  const [numOfEntries, setNumOfEntries] = useState(0);
  const [pastAppointmentList, setPastAppointmentList] = useState<
    IAppointment[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointments = await request(
          `/api/appointments/past?userId=${userId}`,
          {
            method: "GET",
          },
        );
        setNumOfEntries(appointments.length);
        setPastAppointmentList(appointments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <Box>
      <Typography variant="h3">Past Appointments</Typography>
      {pastAppointmentList.map((appointment, index) => (
        <PastAppointmentCard
          key={index}
          index={index}
          issueName={appointment.issueName}
          closedDate={new Date(appointment.closedDate)}
          appointmentId={appointment._id}
        />
      ))}
      <Typography variant="h6" align="center">
        -- {numOfEntries} Entries Found --
      </Typography>
    </Box>
  );
};

export default PastAppointmentList;
