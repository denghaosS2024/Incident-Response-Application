import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type IIncident from "../../../models/Incident";
import { updateIncident } from "../../../redux/incidentSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import request from "../../../utils/request";
import ConfirmationDialog from "../../common/ConfirmationDialog";

interface SARStep5Props {
  incidentId?: string;
}

const SARStep5: React.FC<SARStep5Props> = ({ incidentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidentData, setIncidentData] = useState<IIncident | null>(null);
  const [status, setStatus] = useState<string>("Active");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const incident = useSelector(
    (state: RootState) => state.incidentState.incident,
  );
  const isClosed = incidentData?.incidentState === "Closed";

  // Status options for SAR incidents
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Suspended", label: "Suspended" },
    { value: "Completed", label: "Completed" },
    { value: "Closed", label: "Closed" },
  ];

  // Fetch incident details and update Redux state
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        console.log("SARStep5: Current incident state:", incident);

        // If we have an incident in Redux with necessary data, use that
        if (incident && (incident._id || incident.incidentId)) {
          console.log("SARStep5: Using incident from Redux store");
          setIncidentData(incident);
          setStatus(incident.incidentState || "Active");
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API if we have an incidentId
        if (incidentId) {
          console.log("SARStep5: Fetching incident by ID:", incidentId);
          const data = await request(`/api/incidents?incidentId=${incidentId}`);
          if (Array.isArray(data) && data.length > 0) {
            const fetchedIncident = data[0];
            console.log("SARStep5: Fetched incident:", fetchedIncident);
            setIncidentData(fetchedIncident);
            dispatch(updateIncident(fetchedIncident));
            setStatus(fetchedIncident.incidentState ?? "Active");
          } else {
            console.error("SARStep5: No incident found for this incidentId");
            setError("No incident found for this incidentId");
          }
        } else {
          console.error(
            "SARStep5: No incident data available - no incidentId provided",
          );
          setError("No incident data available");
        }
      } catch (err: any) {
        console.error("SARStep5: Error fetching incident details:", err);
        setError(
          `Failed to load incident details: ${err.message ?? "Unknown error"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentDetails();
  }, [incidentId, dispatch, incident]);

  // Function to handle status change and save immediately
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus); // Update UI state immediately
    if (!incidentData) return;
    try {
      setLoading(true);
      setError(null);

      const updatedIncident = {
        incidentId: incidentData.incidentId,
        incidentState: newStatus,
        commander: incidentData.commander,
      };

      let updateResponse;
      try {
        updateResponse = await request("/api/incidents/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIncident),
        });
      } catch (e: any) {
        if (e.message && e.message.includes("Unexpected end of JSON input")) {
          updateResponse = { status: 204 };
        } else {
          throw e;
        }
      }

      if (updateResponse.status !== 204) {
        throw new Error("Failed to update incident");
      }

      dispatch(
        updateIncident({
          ...incidentData,
          incidentState: newStatus,
        }),
      );
    } catch (err) {
      console.error("Error updating incident:", err);
      setError("Failed to update incident");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handler to resources page
  const handleNavigateToResources = () => {
    navigate(`/resources`);
  };

  // Close incident handlers
  const handleCloseIncidentClick = () => {
    setShowCloseConfirm(true);
  };

  const handleCancelCloseIncident = () => {
    setShowCloseConfirm(false);
  };

  const handleConfirmCloseIncident = async () => {
    setShowCloseConfirm(false);

    if (!incidentData?.incidentId) {
      setError("No incident ID found to close");
      return;
    }

    try {
      setLoading(true);

      const closedIncident = await request<IIncident>(
        `/api/incidents/${incidentData.incidentId}`,
        {
          method: "DELETE",
        },
      );

      dispatch(updateIncident(closedIncident));
      setIncidentData(closedIncident);
      console.log("Incident closed successfully");
    } catch (err: any) {
      console.error("Error closing incident:", err);
      setError(err.message ?? "Unknown error while closing incident");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Paper>
    );
  }

  if (!incidentData) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <Typography>No incident data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: "900px", mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          SAR Operation Summary
        </Typography>
        <Typography variant="subtitle1" align="center">
          Review and finalize the search and rescue operation
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Incident Details
        </Typography>
        <Typography>
          Incident Open:{" "}
          {new Date(incidentData.openingDate || "").toLocaleString()}
        </Typography>
        <Typography>Incident ID: {incidentData.incidentId}</Typography>
        <Typography>
          Incident Caller: {incidentData.caller || "None"}
        </Typography>
        <Typography>
          Last Known Location: {incidentData.address || "Not specified"}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Operation Status
        </Typography>
        {isClosed ? (
          <Typography>{status}</Typography>
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value as string)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Team Information
        </Typography>
        <Typography>Owner: {incidentData.owner || "Not assigned"}</Typography>
        <Typography>
          Commander: {incidentData.commander || "Not assigned"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
        {!isClosed && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateToResources}
              size="large"
            >
              Allocate Resources
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCloseIncidentClick}
              size="large"
            >
              Close Incident
            </Button>
          </>
        )}

        {isClosed && (
          <Box
            sx={{
              mt: 3,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              pointerEvents: "auto",
              position: "relative",
              zIndex: 1001,
            }}
          >
            <Typography variant="h6" color="error">
              Incident is Closed
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ zIndex: 1001 }}
              onClick={() => {
                navigate("/incidents/report", {
                  state: { incidentData },
                });
              }}
            >
              Generate Report
            </Button>
          </Box>
        )}
      </Box>

      <ConfirmationDialog
        open={showCloseConfirm}
        title="Confirm Close"
        description="Are you sure you want to close this incident? This action cannot be undone."
        onConfirm={handleConfirmCloseIncident}
        onCancel={handleCancelCloseIncident}
        confirmText="Yes"
        cancelText="No"
      />
    </Paper>
  );
};

export default SARStep5;
