import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";
import request from "../utils/request";
import IIncident from "../models/Incident";
import FundingSummaryCard from "../components/FundingCenter/FundingSummaryCard";
import IncidentList from "../components/FundingCenter/IncidentList";

const FundingCenter: React.FC = () => {
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const [totalFunds, setTotalFunds] = useState<number>(0);
  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const navigate = useNavigate();

  const handleChatDirector = async () => {
    const chief = await request(`/api/users/usernames/${username}`, {
      method: "GET",
    });
    console.log(chief);
    const res = await request(
      `/api/users/cities/directors/${chief.assignedCity}`,
      { method: "GET" },
    );

    if (res.role) {
      navigate(`/directorchatroom/${chief.assignedCity}/${chief.role}`);
    } else {
      alert(res.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const chief = await request(`/api/users/usernames/${username}`, {
        method: "GET",
      });

      if (userRole === "Fire Chief") {
        const fireFunding = await request(
          `/api/cities/fire-funding/${chief.assignedCity}`,
          { method: "GET" },
        );
        setTotalFunds(fireFunding);
      } else if (userRole === "Police Chief") {
        const policeFunding = await request(
          `/api/cities/police-funding/${chief.assignedCity}`,
          { method: "GET" },
        );
        setTotalFunds(policeFunding);
      }

      const incidents = await request(`/api/incidents/${chief.assignedCity}`, {
        method: "GET",
      });
      const sortedIncidents = incidents.sort(
        (a: any, b: any) =>
          new Date(b.openingDate).getTime() - new Date(a.openingDate).getTime(),
      );
      setIncidents(sortedIncidents);
    };

    fetchData();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Funding Center
        <Button
          variant="outlined"
          color="primary"
          onClick={handleChatDirector}
          sx={{ ml: 1 }}
        >
          Chat With Director
        </Button>
      </Typography>
      <FundingSummaryCard totalFunds={totalFunds} />
      <IncidentList incidents={incidents} />
    </Box>
  );
};

export default FundingCenter;
