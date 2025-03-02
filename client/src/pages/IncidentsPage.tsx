import GenericListContainer from '../components/GenericListContainer';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { NavigateNext as Arrow } from '@mui/icons-material';

interface IncidentData {
    id: string;
    openDate: string;
    type: string;
    priority: string;
    state: string;
  }
  
const INCIDENT_STATES = ['Waiting', 'Triage', 'Assigned', 'Closed'];

function IncidentsPage() {
  const [role, setRole] = useState('guest'); // default to 'guest' if not set
  const [data, setData] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                  {/* Arrow icon at the end */}
                  <IconButton edge="end" size="large" onClick={() => console.log('chat with', incident.id)}>
                    <Arrow />
                  </IconButton>
                </Box>
              ),
            }}
          />
        );
      })}
    </Box>
  );
}

export default IncidentsPage;
