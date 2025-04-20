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
        const { appointments } = await request(
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
    // TODO: uncomment fetchData when backend is ready
    // fetchData();

    // test Data
    // setNumOfEntries(2);
    // setPastAppointmentList([
    //   {
    //     appointmentId: "111",
    //     userId: "abcdefg",
    //     nurseId: "abcd",
    //     createDate: new Date(Date.now()),
    //     updateDate: new Date(Date.now()),
    //     closedDate: new Date(Date.now()),
    //     isResolved: true,
    //     issueName: "headache",
    //     note: "111",
    //     severityIndex: 1,
    //   },
    //   {
    //     appointmentId: "112",
    //     userId: "abcdefg",
    //     nurseId: "abcd",
    //     createDate: new Date(Date.now()),
    //     updateDate: new Date(Date.now()),
    //     closedDate: new Date(Date.now()),
    //     isResolved: true,
    //     issueName: "headache 2",
    //     note: "111",
    //     severityIndex: 1,
    //   },
    // ]);
  }, [userId]);

  return (
    <Box>
      <Typography variant="h3">Past Appointments</Typography>
      {pastAppointmentList.map((appointment, index) => (
        <PastAppointmentCard
          key={index}
          index={index}
          issueName={appointment.issueName}
          closedDate={appointment.closedDate}
          appointmentId={appointment.appointmentId}
        />
      ))}
      <Typography variant="h6" align="center">
        -- {numOfEntries} Entries Found --
      </Typography>
    </Box>
  );
};

export default PastAppointmentList;
