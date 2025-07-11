import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router";
import request from "../utils/request";
import IIncident from "../models/Incident";
import FundingSummaryCard from "../components/FundingCenter/FundingSummaryCard";
import IncidentList from "../components/FundingCenter/IncidentList";
import SocketClient from "../utils/Socket";
import DepartmentFundingTable from "../components/FundingCenter/DepartmentFundingTable";
import AlertSnackbar from "../components/common/AlertSnackbar";

interface IDepartmentFunding {
  name: string;
  request: number;
  department: string;
}

interface Chief {
  chiefId: string;
  username: string;
  role: string;
}
const FundingCenter: React.FC = () => {
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const [totalFunds, setTotalFunds] = useState<number>(0);
  const [assignedCity, setAssignedCity] = useState<string>("");
  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [departmentRequests, setDepartmentRequests] = useState<
    IDepartmentFunding[]
  >([]);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChatDirector = async () => {
    try {
      const chief = await request(`/api/users/usernames/${username}`, {
        method: "GET",
      });

      const res = await request(
        `/api/users/cities/directors/${chief.assignedCity}`,
        { method: "GET" },
      );

      if (res.role) {
        navigate(`/directorchatroom/${chief.assignedCity}/${chief.role}`);
      } else {
        setOpenSnackbar(true);
        setSnackbarMessage("No Director Found");
      }
    } catch (error) {
      setOpenSnackbar(true);
      setSnackbarMessage("City is not Assigned or No Director Found");
    }
  };

  const handleChat = async (chiefName: string, department: string) => {
    try {
      const chief = await request(`/api/users/usernames/${chiefName}`, {
        method: "GET",
      });
      const res = await request(
        `/api/users/cities/directors/${chief.assignedCity}`,
        { method: "GET" },
      );

      if (res.role) {
        if (department == "Fire") {
          navigate(`/directorchatroom/${chief.assignedCity}/Fire%20Chief`);
        } else {
          navigate(`/directorchatroom/${chief.assignedCity}/Police%20Chief`);
        }
      }
    } catch (error) {
      setOpenSnackbar(true);
      setSnackbarMessage("City is not Assigned or No Chief Found");
    }
  };

  const fetchData = async () => {
    const user = await request(`/api/users/usernames/${username}`, {
      method: "GET",
    });
    setAssignedCity(user.assignedCity);

    if (userRole === "Fire Chief") {
      const fireFunding = await request(
        `/api/cities/fire-funding/${user.assignedCity}`,
        { method: "GET" },
      );
      setTotalFunds(fireFunding);
    } else if (userRole === "Police Chief") {
      const policeFunding = await request(
        `/api/cities/police-funding/${user.assignedCity}`,
        { method: "GET" },
      );
      setTotalFunds(policeFunding);
    } else if (userRole === "City Director") {
      // Fetch total city funding
      const totalCityFunding = await request(
        `/api/cities/remaining-funding/${user.assignedCity}`,
        { method: "GET" },
      );
      setTotalFunds(totalCityFunding);

      // Fetch department funding requests
      try {
        const chiefs = await request<Chief[]>(
          `/api/users/chiefs/${user.assignedCity}`,
          { method: "GET" },
        );

        const fundingRequests: IDepartmentFunding[] = [];

        for (const chief of chiefs) {
          // You might need to fetch the actual request amounts from your API
          const requestAmount = await request(
            `/api/cities/${user.assignedCity}/unassigned-funding-requests/${chief.role}`,
            { method: "GET" },
          );
          fundingRequests.push({
            name: chief.username,
            request: requestAmount,
            department: chief.role === "Fire Chief" ? "Fire" : "Police",
          });
        }

        setDepartmentRequests(fundingRequests);
      } catch (error) {
        console.error("Error fetching chiefs:", error);
        // Create sample data for demonstration
        setDepartmentRequests([
          { name: "FireChief1", request: 1000, department: "Fire" },
          { name: "PoliceChief1", request: 500, department: "Police" },
        ]);
      }
    }
    const threshold = 200;
    const incidents = await request(`/api/incidents/${user.assignedCity}`, {
      method: "GET",
    });
    const sortedIncidents = incidents.sort((a: any, b: any) => {
      const aLow = a.fund_left < threshold;
      const bLow = b.fund_left < threshold;

      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;

      return (
        new Date(b.openingDate).getTime() - new Date(a.openingDate).getTime()
      );
    });
    setIncidents(sortedIncidents);
  };

  useEffect(() => {
    fetchData();

    const socket = SocketClient;

    socket.on("incidentFundingUpdated", () => {
      fetchData();
    });

    return () => {
      socket.off("incidentFundingUpdated");
    };
  }, []);

  // Render different content based on user role
  const renderContent = () => {
    if (userRole === "Fire Chief" || userRole === "Police Chief") {
      return (
        <>
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
          <FundingSummaryCard
            totalFunds={totalFunds}
            role={userRole}
            cityName={assignedCity}
          />
          <IncidentList incidents={incidents} />
          <AlertSnackbar
            open={openSnackbar}
            onClose={() => setOpenSnackbar(false)}
            message={snackbarMessage}
            severity="error"
          />
        </>
      );
    } else if (userRole === "City Director") {
      return (
        <>
          <Typography variant="h5" gutterBottom>
            Funding Center
          </Typography>

          <FundingSummaryCard
            totalFunds={totalFunds}
            role={userRole}
            cityName={assignedCity}
          />

          <DepartmentFundingTable
            departmentRequests={departmentRequests}
            onChatClick={handleChat}
          />
          <AlertSnackbar
            open={openSnackbar}
            onClose={() => setOpenSnackbar(false)}
            message={snackbarMessage}
            severity="error"
          />
        </>
      );
    }

    return <Typography>Loading...</Typography>;
  };

  return <Box p={2}>{renderContent()}</Box>;
};

export default FundingCenter;
