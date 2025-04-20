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
      <Typography
        variant="h4"
        sx={{ padding: "16px 16px", fontWeight: "bold" }}
      >
        Past Appointments
      </Typography>
      {pastAppointmentList.map((appointment, index) => (
        <PastAppointmentCard
          key={index}
          index={index}
          issueName={appointment.issueName}
          closedDate={new Date(appointment.closedDate)}
          appointmentId={appointment._id}
        />
      ))}

      {numOfEntries > 0 ? (
        <Typography variant="h6" align="center">
          -- {numOfEntries} entries found --
        </Typography>
      ) : (
        <Typography variant="h6" align="center">
          -- no entries found --
        </Typography>
      )}
    </Box>
  );
};

export default PastAppointmentList;
