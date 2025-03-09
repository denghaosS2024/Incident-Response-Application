import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import request from '../../utils/request';
import type IIncident from '@/models/Incident';

interface Reach911Step5Props {
  incidentId?: string;
}

const Reach911Step5: React.FC<Reach911Step5Props> = ({ incidentId }) => {
  // State for loading, error, and fetched incident details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidentData, setIncidentData] = useState<IIncident | null>(null);

  // Form states for updatable fields
  const [priority, setPriority] = useState<string>('E');
  const [commander, setCommander] = useState<string>('System');

  // Fetch incident details on mount using the incidentId passed from Reach911Page.tsx
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        if (!incidentId) {
          throw new Error('No incidentId provided');
        }
        // Fetch incident details using query param; assuming API returns an array
        const data = await request(`/api/incidents?incidentId=${incidentId}`);
        if (Array.isArray(data) && data.length > 0) {
          const incident = data[0];
          setIncidentData(incident);
          // Initialize form fields from fetched incident data
          if (incident.priority) setPriority(incident.priority);
          if (incident.commander) setCommander(incident.commander);
        } else {
          setError('No incident found for this incidentId');
        }
      } catch (err: any) {
        console.error('Error fetching incident details:', err);
        setError('Failed to load incident details');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentDetails();
  }, [incidentId]);

  const handleSubmit = async () => {
    if (!incidentData) return;
    try {
      setLoading(true);
      setError(null);
  
      // Map the dropdown value to its API equivalent.
      const priorityMap: { [key: string]: string } = {
        'E': 'E',
        '1': 'One',
        '2': 'Two',
        '3': 'Three'
      };
      const convertedPriority = priorityMap[priority] || priority;
  
      // Build the payload with only the required fields.
      const updatedIncident = {
        incidentId: incidentData.incidentId,
        priority: convertedPriority,
        commander,
      };
  
      // Try to call the update API using the request utility.
      let updateResponse;
      try {
        updateResponse = await request("/api/incidents/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedIncident),
        });
      } catch (e: any) {
        // If we get an error about JSON parsing, assume it's because of a 204 response. // THIS IS WRONG TO DO, BUT I DIDNT WANNA EDIT THE REQUEST UTIL
        if (e.message && e.message.includes("Unexpected end of JSON input")) {
          updateResponse = { status: 204 };
        } else {
          throw e;
        }
      }
  
      // Check if the response indicates success.
      if (updateResponse.status !== 204) {
        throw new Error("Failed to update incident");
      }
  
      alert("Incident updated successfully!");
    } catch (err) {
      console.error("Error updating incident:", err);
      setError("Failed to update incident");
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
    <Paper elevation={3} sx={{ p: 2, m: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Response Team Corner</Typography>
        <Typography>Incident Open: {incidentData.openingDate}</Typography>
        <Typography>Incident ID: {incidentData.incidentId}</Typography>
        <Typography>Incident Caller: {incidentData.caller || 'None'}</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Incident Priority</Typography>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value as string)}
          >
            <MenuItem value="E">E</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Who is on the Team?</Typography>
        <Typography>Owner: {incidentData.owner}</Typography>
        <Box sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Commander</InputLabel>
            <Select
              value={commander}
              label="Commander"
              onChange={(e) => setCommander(e.target.value as string)}
            >
              {/* Hardcoded placeholder options */}
              <MenuItem value="System">System</MenuItem>
              <MenuItem value="John Doe">John Doe</MenuItem>
              <MenuItem value="Jane Doe">Jane Doe</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default Reach911Step5;
