import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { IIncident } from "../models/Incident";
import { updateIncident } from "../redux/incidentSlice";
import request from "../utils/request";
import { ISpending } from "@/models/Spending";

const FundingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams<{ incidentId: string }>();
  const [fundingHistory, setFundingHistory] = useState<
    { assignedAmount: number; timestamp: Date; assignedBy: string }[]
  >([]);
  const [incidentName, setIncidentName] = useState<string>("");
  const [newFundingAmount, setNewFundingAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fundingLeft, setFundingLeft] = useState<number>(0);
  const [fundAssigned, setFundAssigned] = useState<number>(0);
  const [totalRemainingFunds, setTotalRemainingFunds] = useState<number>(0);
  const dispatch = useDispatch();
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchFundingHistory = async () => {
      try {
        const incidents = await request(
          `/api/incidents/?incidentId=${incidentId}`,
          { method: "GET" },
        );
        const incident = incidents[0];
        setIncidentName(incident.incidentId);
        setFundingHistory(incident.fundingHistory);
        setFundingLeft(incident.fund_left);
        setFundAssigned(incident.fund_assigned);

        // Fetch total remaining funds from funding center
        const user = await request(`/api/users/usernames/${username}`, {
          method: "GET",
        });

        if (userRole === "Fire Chief") {
          const fireFunding = await request(
            `/api/cities/fire-funding/${user.assignedCity}`,
            { method: "GET" },
          );
          setTotalRemainingFunds(fireFunding);
        } else if (userRole === "Police Chief") {
          const policeFunding = await request(
            `/api/cities/police-funding/${user.assignedCity}`,
            { method: "GET" },
          );
          setTotalRemainingFunds(policeFunding);
        }
      } catch (err) {
        console.error("Error fetching funding history:", err);
      }
    };

    fetchFundingHistory();
  }, [incidentId]);

  const handleAssignFunding = async () => {
    const amount = parseFloat(newFundingAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    if (amount > totalRemainingFunds) {
      setError(
        `Cannot assign more than the remaining funds ($${totalRemainingFunds})`,
      );
      return;
    }

    const assignedBy = localStorage.getItem("username") || "System";
    const newFundingEntry = {
      assignedAmount: amount,
      timestamp: new Date(),
      assignedBy,
    };

    const newFundingEntryRedux = {
      assignedAmount: amount,
      timestamp: newFundingEntry.timestamp.toISOString(),
      assignedBy,
    };

    const incidents = await request(
      `/api/incidents/?incidentId=${incidentId}`,
      { method: "GET" },
    );
    const currentIncident = incidents[0];

    const spendings = await request(
      `/api/spendings/?incidentId=${incidentId}`,
      { method: "GET" },
    );

    // Calculate total spending
    const total_spending = spendings.reduce(
      (sum: number, spending: ISpending) => sum + spending.amount,
      0,
    );

    const newIncident: IIncident = {
      ...currentIncident,
      fundingHistory: [...fundingHistory, newFundingEntryRedux],
      fund_assigned: fundAssigned + amount,
      fund_left: fundAssigned + amount - total_spending,
    };

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/incidents/update`;
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newIncident),
    });

    // Update funding center remaining amount
    await request(
      `/api/cities/department-remaining-funding/${currentIncident.city}`,
      {
        method: "PUT",
        body: JSON.stringify({
          amount: totalRemainingFunds - amount,
          role: userRole,
        }),
      },
    );

    const updatedFundingHistory = [...fundingHistory, newFundingEntry];
    setFundingHistory(updatedFundingHistory);
    setFundAssigned(fundAssigned + amount);
    setFundingLeft(fundingLeft - amount);
    setTotalRemainingFunds(totalRemainingFunds - amount);
    setNewFundingAmount("");
    setError("");

    dispatch(updateIncident(newIncident));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ width: "100%", maxWidth: 360, mx: "auto", marginTop: 2 }}
    >
      <Box sx={{ textAlign: "left", width: "100%" }}>
        <Typography variant="h5">{incidentName}</Typography>

        {fundingHistory.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={100}
          >
            <Typography variant="body1" color="textSecondary">
              No funding history
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%" }}>
            {fundingHistory.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`$${item.assignedAmount.toLocaleString()}`}
                  secondary={`Assigned by ${item.assignedBy} on ${new Date(item.timestamp).toLocaleString()}`}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box
        mt={4}
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap={2}
      >
        <TextField
          label="Funding Amount"
          variant="outlined"
          type="number"
          value={newFundingAmount}
          onChange={(e) => setNewFundingAmount(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignFunding}
        >
          Assign
        </Button>
      </Box>
    </Box>
  );
};

export default FundingHistory;
