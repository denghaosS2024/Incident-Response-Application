import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CircularProgress, Fab, IconButton, List, ListItem, ListItemText, Paper, styled, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import ROLES from '../utils/Roles';

// Define hospital interface
interface Hospital {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  nurses: string[];
}

// Define patient types based on categories
interface PatientItem {
  patientId: string;
  name: string;
  priority: string;
  bedId: string;
}

interface PatientsByCategory {
  requesting: PatientItem[];
  ready: PatientItem[];
  inUse: PatientItem[];
  discharged: PatientItem[];
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

const NursePatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientsByCategory>({
    requesting: [],
    ready: [],
    inUse: [],
    discharged: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState<string>('');
  const navigate = useNavigate();
  
  // Get user information from localStorage
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('uid');
  
  // Only allow nurses to access this page
  useEffect(() => {
    if (userRole !== ROLES.NURSE) {
      navigate('/');
    }
  }, [userRole, navigate]);
  
  // Fetch the nurse's hospital information
  useEffect(() => {
    const fetchHospitalInfo = async () => {
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      
      try {
        // Get all hospitals and find the one where this nurse is assigned
        const hospitals = await request('/api/hospital', {
          method: 'GET',
        }) as Hospital[];
        
        const nurseHospital = hospitals.find(hospital => 
          hospital.nurses.includes(userId)
        );
        
        if (nurseHospital) {
          setHospitalId(nurseHospital.hospitalId);
          setHospitalName(nurseHospital.hospitalName);
        } else {
          setError('Nurse is not assigned to any hospital');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching hospital info:', err);
        setError('Failed to load hospital information');
        setLoading(false);
      }
    };

    fetchHospitalInfo();
  }, [userId]);
  
  // Fetch patients data for the hospital where the nurse works
  useEffect(() => {
    const fetchPatientsData = async () => {
      if (!hospitalId) {
        return; // Wait until we have the hospitalId
      }
      
      try {
        const response = await request(`/api/erbed/hospital/${hospitalId}/patients`, {
          method: 'GET',
        });
        
        setPatients(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients data');
        setLoading(false);
      }
    };

    if (hospitalId) {
      fetchPatientsData();
    }
  }, [hospitalId]);

  // Navigate to patient detail page
  const handlePatientClick = (patientId: string) => {
    navigate(`/patient-profile/${patientId}`);
  };

  // Navigate to patient admission page
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
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        Drag patients to change category:
      </Typography>
      
      {/* Requesting an ER Bed */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          Requesting an ER Bed
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.requesting.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.requesting.map((patient) => (
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
      
      {/* With an ER Bed Ready */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          With an ER Bed Ready
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.ready.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.ready.map((patient) => (
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
      
      {/* In an ER Bed */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          In an ER Bed
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.inUse.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.inUse.map((patient) => (
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
      
      {/* Discharged from ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          Discharged from ER
        </Typography>
      </CategoryHeader>
      <List sx={{ width: '100%' }}>
        {patients.discharged.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.discharged.map((patient) => (
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

export default NursePatientsPage; 

