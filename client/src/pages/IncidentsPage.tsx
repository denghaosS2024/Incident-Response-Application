import GenericListContainer from '../components/GenericListContainer';
import { Box, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Add, NavigateNext as Arrow, Settings } from '@mui/icons-material';

interface IncidentData {
    id: string;
    openDate: string;
    type: string;
    priority: string;
    state: string;
  }
  
const INCIDENT_STATES = ['Waiting', 'Triage', 'Assigned', 'Closed'];

function IncidentsPage() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [data, setData] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState('All');

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
        const module = await import('./dummy.json');
        const jsonData = module.default;
        console.log(jsonData);
        setData(jsonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Incidents Dashboard 
      </Typography>
      {INCIDENT_STATES.map((state) => {
        const incidentsForState = data.filter(
          (incident) => incident.state === state
        );
        return (
          <GenericListContainer<IncidentData>
            key={state}
            header={state}
            listProps={{
              items: incidentsForState,
              loading: false,
              getKey: (incident: IncidentData) => incident.id,
              renderItem: (incident: IncidentData) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 1,
                  }}
                >
                  {/* Left 75%: id and openDate */}
                  <Box sx={{ flex: 3, display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {incident.id}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {incident.openDate}
                    </Typography>
                  </Box>
                  {/* Middle 25%: type and priority aligned to right */}
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Typography variant="body2" sx={{ marginRight: 1 }}>
                      {incident.type}
                    </Typography>
                    <Typography variant="body2">
                      {incident.priority}
                    </Typography>
                  </Box>
                  <IconButton edge="end" size="large">
                    <Arrow />
                  </IconButton>
                </Box>
              ),
            }}
          />
        );
      })}

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
    </Box>
  );
}

export default IncidentsPage;
