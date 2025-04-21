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

const FundingHistory: React.FC = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams<{ incidentId: string }>();
  const [fundingHistory, setFundingHistory] = useState<
    { assignedAmount: number; timestamp: Date; assignedBy: string }[]
  >([]);
  const [newFundingAmount, setNewFundingAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fundingLeft, setFundingLeft] = useState<number>(0);
  const [fundAssigned, setFundAssigned] = useState<number>(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFundingHistory = async () => {
      try {
        const incidents = await request(
          `/api/incidents/?incidentId=${incidentId}`,
          { method: "GET" },
        );
        const incident = incidents[0];

        setFundingHistory(incident.fundingHistory);
        setFundingLeft(incident.fund_left);
        setFundAssigned(incident.fund_assigned);
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

    if (amount > fundingLeft) {
      setError(`Cannot assign more than the remaining funds ($${fundingLeft})`);
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

    const newIncident: IIncident = {
      ...currentIncident,
      fundingHistory: [...fundingHistory, newFundingEntryRedux],
      fund_assigned: fundAssigned + amount,
      fund_left: fundingLeft - amount,
    };

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/incidents/update`;
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newIncident),
    });

    const updatedFundingHistory = [...fundingHistory, newFundingEntry];
    setFundingHistory(updatedFundingHistory);
    setFundAssigned(fundAssigned + amount);
    setFundingLeft(fundingLeft - amount);
    setNewFundingAmount("");
    setError("");

    dispatch(updateIncident(newIncident));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
    >
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
        <List>
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
