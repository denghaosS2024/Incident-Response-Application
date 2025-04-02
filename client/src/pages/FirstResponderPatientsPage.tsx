import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CircularProgress, Fab, IconButton, List, ListItem, ListItemText, Paper, styled, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import request from '../utils/request';
import ROLES from '../utils/Roles';

// Define patient types based on categories
interface Patient {
  patientId: string;
  name: string;
  priority: string;
  location: string;
  incidentId?: string;
}

interface PatientsByCategory {
  toTakeToER: Patient[];
  atER: Patient[];
  others: Patient[];
}

// Styled components
const CategoryHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: '#c4ddff',
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  width: '100%',
}));

const PatientListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
  border: '1px solid #e0e0e0',
}));

const FirstResponderPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientsByCategory>({
    toTakeToER: [],
    atER: [],
    others: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get user information from localStorage
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('uid');
  const username = localStorage.getItem('username');
  
  // Only allow Fire and Police to access this page
  useEffect(() => {
    if (userRole !== ROLES.FIRE && userRole !== ROLES.POLICE) {
      navigate('/');
    }
  }, [userRole, navigate]);
  
  // Fetch patients data for the responder's incidents
  useEffect(() => {
    const fetchPatientsData = async () => {
      if (!username) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      
      try {
        // First get incidents that the responder is associated with
        const incidents = await request(`/api/incidents?commander=${username}`, {
          method: 'GET',
        });
        
        if (!incidents || incidents.length === 0) {
          setLoading(false);
          return;
        }
        
        // Get all patients
        const allPatients = await request('/api/patients', {
          method: 'GET',
        });
        
        if (!allPatients || allPatients.length === 0) {
          setLoading(false);
          return;
        }
        
        // Filter patients related to the responder's incidents
        const incidentIds = incidents.map((incident: any) => incident.incidentId);
        
        const responderPatients = allPatients.filter((patient: any) => {
          if (!patient.visitLog || patient.visitLog.length === 0) return false;
          
          // Check if any visit log entry is associated with one of the responder's incidents
          return patient.visitLog.some((log: any) => 
            incidentIds.includes(log.incidentId)
          );
        });
        
        // Sort and categorize patients
        const categorizedPatients: PatientsByCategory = {
          toTakeToER: [],
          atER: [],
          others: []
        };
        
        responderPatients.forEach((patient: any) => {
          // Use the most recent visit log for categorization
          const recentLog = patient.visitLog.sort((a: any, b: any) => 
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
          )[0];
          
          const patientItem: Patient = {
            patientId: patient.patientId,
            name: patient.name,
            priority: recentLog.priority || '4',
            location: recentLog.location || 'Unknown',
            incidentId: recentLog.incidentId
          };
          
          // Categorize based on priority and location
          if ((patientItem.priority === 'E' || patientItem.priority === '1') && patientItem.location === 'Road') {
            categorizedPatients.toTakeToER.push(patientItem);
          } else if ((patientItem.priority === 'E' || patientItem.priority === '1') && patientItem.location === 'ER') {
            categorizedPatients.atER.push(patientItem);
          } else {
            categorizedPatients.others.push(patientItem);
          }
        });
        
        // Sort patients by priority in each category
        const priorityOrder: Record<string, number> = {
          'E': 0,
          '1': 1,
          '2': 2,
          '3': 3,
          '4': 4
        };
        
        const sortByPriority = (a: Patient, b: Patient) => {
          return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
        };
        
        categorizedPatients.toTakeToER.sort(sortByPriority);
        categorizedPatients.atER.sort(sortByPriority);
        categorizedPatients.others.sort(sortByPriority);
        
        setPatients(categorizedPatients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients data');
        setLoading(false);
      }
    };

    fetchPatientsData();
  }, [username]);

  // Navigate to patient detail page
  const handlePatientClick = (patientId: string) => {
    navigate(`/patient-profile/${patientId}`);
  };

  // Navigate to empty patient screen (as per wireframe)
  const handleAddPatient = () => {
    navigate('/patients/admit');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', padding: 2, position: 'relative', pb: 10 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Patients
      </Typography>
      
      {/* To Take To ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          To Take To ER
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.toTakeToER.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.toTakeToER.map((patient) => (
            <PatientListItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText 
                primary={patient.name} 
                sx={{ flex: '3 1 auto' }}
              />
              <Box sx={{ flex: '1 1 auto', textAlign: 'center' }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>
      
      {/* At ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          At ER
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.atER.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.atER.map((patient) => (
            <PatientListItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText 
                primary={patient.name} 
                sx={{ flex: '3 1 auto' }}
              />
              <Box sx={{ flex: '1 1 auto', textAlign: 'center' }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>
      
      {/* Others */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          Others
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.others.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.others.map((patient) => (
            <PatientListItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText 
                primary={patient.name} 
                sx={{ flex: '3 1 auto' }}
              />
              <Box sx={{ flex: '1 1 auto', textAlign: 'center' }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>
      
      {/* Add Patient FAB */}
      <Fab 
        color="primary" 
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        onClick={handleAddPatient}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default FirstResponderPatientsPage;
