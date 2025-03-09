import GenericListContainer from '../components/GenericListContainer';
import {
  Box,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Add, NavigateNext as Arrow, Settings } from '@mui/icons-material';
import { IncidentType } from '../models/Incident';
import request from '../utils/request';
import { useNavigate } from 'react-router-dom';

interface IncidentData {
  incidentId: string;
  openingDate: string;
  type: string;
  priority: string;
  incidentState: string;
  owner: string;
  commander: string;
}

function IncidentsPage() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [data, setData] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [userId] = useState(localStorage.getItem('username') || '');
  const [filteredData, setFilteredData] = useState<IncidentData[]>([]);
  const navigate = useNavigate();

  // Retrieve role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  }, []);

  // Fetch incidents from the server
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await request('/api/incidents');
        setData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role]);

  // Filter incidents based on selected type
  useEffect(() => {
    if (selectedType === 'All') {
      setFilteredData(data);
    } else {
      const mappedType = {
        Fire: IncidentType.Fire,
        Medical: IncidentType.Medical,
        Police: IncidentType.Police,
        Unset: IncidentType.Unset,
      }[selectedType];
      setFilteredData(data.filter((incident) => incident.type === mappedType));
    }
  }, [selectedType, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Group incidents for display based on role
  let incidentGroups: { [key: string]: IncidentData[] } = {};
  if (role === 'Fire' || role === 'Police') {
    incidentGroups = {
      "My Incident": filteredData.filter((incident) => incident.commander === userId),
      "Other Open Incidents": filteredData.filter(
        (incident) => incident.commander !== userId && incident.incidentState !== "Closed"
      ),
      "Closed Incidents": filteredData.filter((incident) => incident.incidentState === "Closed"),
    };
  } else {
    incidentGroups = {
      "Waiting": filteredData.filter((incident) => incident.incidentState === "Waiting"),
      "Triage": filteredData.filter((incident) => incident.incidentState === "Triage"),
      "Assigned": filteredData.filter((incident) => incident.incidentState === "Assigned"),
      "Closed": filteredData.filter((incident) => incident.incidentState === "Closed"),
    };
  }

  // Create new incident when the + button is clicked and redirect to the first page
  const handleAddIncident = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) throw new Error("Username not found in local storage.");

      let incidentCount = 1;
      try {
        const userIncidents = await request(`/api/incidents?caller=${username}`);
        incidentCount = Array.isArray(userIncidents) ? userIncidents.length + 1 : 1;
      } catch (error: any) {
        if (error.status !== 404) throw error;
      }
      const incidentId = `I${username}${incidentCount}`;
      const newIncident = {
        incidentId,
        caller: username,
        openingDate: new Date().toISOString(),
        incidentState: "Assigned",
        owner: username,
        commander: username,
      };

      await request("/api/incidents/new", {
        method: "POST",
        body: JSON.stringify(newIncident),
        headers: { "Content-Type": "application/json" },
      });

      navigate("/reach911", {
        state: {
          incidentId,
          isCreatedByFirstResponder: true,
        },
      });
    } catch (error) {
      console.error("Error creating new incident:", error);
    }
  };

  // Check if the user has an active incident (not closed)
  const hasActiveResponderIncident = data.some(
    (incident) =>
      (incident.owner === userId || incident.commander === userId) &&
      incident.incidentState !== 'Closed'
  );

  // Navigate to incident description with auto-populate on
  const handleIncidentClick = (incident: IncidentData) => {
    let readOnly = false;
    if (incident.incidentState === "Closed" || (incident.commander !== userId && incident.owner !== userId)) {
      readOnly = true;
    }
    const autoPopulateData = true;
    navigate("/reach911", {
      state: {
        incidentId: incident.incidentId,
        readOnly,
        autoPopulateData,
      },
    });
  };

  // Render the page
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Incidents Dashboard
      </Typography>
      {Object.entries(incidentGroups).map(([header, incidents]) => (
        <GenericListContainer<IncidentData>
          key={header}
          header={header}
          listProps={{
            items: incidents,
            loading: false,
            getKey: (incident) => incident.incidentId,
            renderItem: (incident) => (
              <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                <Box sx={{ flex: 3, display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {incident.incidentId}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {incident.openingDate}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ marginRight: 1 }}>
                    {incident.type}
                  </Typography>
                  <Typography variant="body2">
                    {incident.priority}
                  </Typography>
                </Box>
                <IconButton edge="end" size="large" onClick={() => handleIncidentClick(incident)}>
                  <Arrow />
                </IconButton>
              </Box>
            ),
          }}
        />
      ))}
      {role === 'Fire' || role === 'Police' ? (
        <>
          <IconButton
            sx={{ position: 'fixed', bottom: 16, left: 18, width: 56, height: 56 }}
            onClick={(event) => setFilterAnchorEl(event.currentTarget)}
          >
            <Settings />
            <Typography variant="caption" sx={{ marginLeft: 1, fontSize: "medium" }}>
              Type
            </Typography>
          </IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem>
              <FormControl fullWidth>
                <Select
                  value={selectedType}
                  onChange={(event) => {
                    setSelectedType(event.target.value);
                    setFilterAnchorEl(null);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Fire">Fire</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Police">Police</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          </Menu>
          {!hasActiveResponderIncident && (
            <IconButton
              sx={{ position: 'fixed', bottom: 16, right: 16, width: 56, height: 56 }}
              onClick={handleAddIncident}
            >
              <Add fontSize="large" />
            </IconButton>
          )}
        </>
      ) : null}
    </Box>
  );
}

export default IncidentsPage;
