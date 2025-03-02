import GenericListContainer from '../components/GenericListContainer';
import { Box, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Add, NavigateNext as Arrow, Settings } from '@mui/icons-material';
import { IncidentType } from '../models/Incident';

interface IncidentData {
    id: string;
    openDate: string;
    type: string;
    priority: string;
    state: string;
    owner: string;
    commander: string;
  }

// ✅ Temporary Hardcoded JSON Data
const TEMP_INCIDENTS: IncidentData[] = [
  {
    id: "IZoe",
    openDate: "10-12-24 7:25",
    type: "F",
    priority: "E",
    state: "Waiting",
    owner: "John Doe",
    commander: "paul",
  },
  {
    id: "IZoe1",
    openDate: "10-12-24 7:25",
    type: "F",
    priority: "E",
    state: "Triage",
    owner: "John Doe",
    commander: "notme",
  },
  {
    id: "IZoe2",
    openDate: "10-12-24 7:25",
    type: "F",
    priority: "E",
    state: "Assigned",
    owner: "John Doe",
    commander: "notme",
  },
  {
    id: "IZoe3",
    openDate: "10-12-24 7:25",
    type: "F",
    priority: "E",
    state: "Closed",
    owner: "John Doe",
    commander: "notme",
  }
];
const INCIDENT_STATES = ['Waiting', 'Triage', 'Assigned', 'Closed'];

function IncidentsPage() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [data, setData] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [userId, setUserId] = useState(localStorage.getItem('username') || '');
  const [filteredData, setFilteredData] = useState<IncidentData[]>([]);

  // Retrieve role from localStorage when the component mounts
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  // Fetch data based on the user's role when 'role' changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let endpoint = '';
      if (role === 'Police') {
        endpoint = '/api/admin/data';
      } else if (role === 'user') {
        endpoint = '/api/user/data';
      } else {
        endpoint = '/api/guest/data';
      }

      try {
        // const response = await fetch(endpoint);
        // if (!response.ok) {
        //   throw new Error(`Failed to fetch data: ${response.statusText}`);
        // }
        // const jsonData = await response.json();
        // read data from dummy.json 
        // const module = await import('./dummy.json');
        // const jsonData = module.default;
        // console.log(jsonData);
        setData(TEMP_INCIDENTS);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role]);

  const IncidentTypeMap: Record<string, IncidentType> = {
    Fire: IncidentType.Fire,
    Medical: IncidentType.Medical,
    Police: IncidentType.Police,
    Unset: IncidentType.Unset,
  };

  useEffect(() => {
    // Filter data based on selected type
    if (selectedType === 'All') {
      setFilteredData(data);
    } else {
      const mappedType = IncidentTypeMap[selectedType];
      setFilteredData(data.filter(incident => incident.type === mappedType));
    }
  }, [selectedType, data]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  let incidentGroups: { [key: string]: IncidentData[] } = {};

  if (role === 'Fire' || role === 'Police') {
    incidentGroups = {
      "My Incident": filteredData.filter((incident : IncidentData) => incident.commander === userId),
      "Other Open Incidents": filteredData.filter((incident : IncidentData) => incident.commander !== userId && incident.state !== "Closed"),
      "Closed Incidents": filteredData.filter((incident : IncidentData) => incident.state === "Closed"),
    };
  } else {
    incidentGroups = {
      "Waiting": filteredData.filter(incident => incident.state === "Waiting"),
      "Triage": filteredData.filter(incident => incident.state === "Triage"),
      "Assigned": filteredData.filter(incident => incident.state === "Assigned"),
      "Closed": filteredData.filter(incident => incident.state === "Closed"),
    };
  }

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
            getKey: (incident) => incident.id,
            renderItem: (incident) => (
              <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                <Box sx={{ flex: 3, display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>{incident.id}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{incident.openDate}</Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ marginRight: 1 }}>{incident.type}</Typography>
                  <Typography variant="body2">{incident.priority}</Typography>
                </Box>
                <IconButton edge="end" size="large">
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
            <Typography variant="caption" sx={{ marginLeft: 1, fontSize: "medium" }}>Type</Typography>
          </IconButton>

          {/* Filter Menu */}
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
          <IconButton
          sx={{ position: 'fixed', bottom: 16, right: 16, width: 56, height: 56 }}
        >
          <Add fontSize="large" />
        </IconButton>
        </>
      ) : null}
    </Box>
  );
}

export default IncidentsPage;
