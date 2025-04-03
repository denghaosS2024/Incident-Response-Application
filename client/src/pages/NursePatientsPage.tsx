import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CircularProgress, Fab, IconButton, List, ListItem, ListItemText, Paper, Snackbar, styled, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f7ff',
  }
}));

const DraggablePatientItem = styled(PatientListItem)(({ theme }) => ({
  '&.dragging': {
    opacity: 0.5,
    backgroundColor: '#e3f2fd',
  },
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
  const [notification, setNotification] = useState<string | null>(null);
  const [draggedPatient, setDraggedPatient] = useState<PatientItem | null>(null);
  const [dragCategory, setDragCategory] = useState<string | null>(null);
  
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
        // Use the new endpoint for nurse view
        const response = await request(`/api/patients/hospital/${hospitalId}/nurse-view`, {
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
    navigate(`/profile/${patientId}`);
  };

  // Navigate to patient admission page
  const handleAddPatient = () => {
    navigate('/patients/admit');
  };

  // Handle drag start
  const handleDragStart = (patient: PatientItem, category: string) => (e: React.DragEvent) => {
    setDraggedPatient(patient);
    setDragCategory(category);
    e.currentTarget.classList.add('dragging');
    
    // Set drag data
    e.dataTransfer.setData('text/plain', JSON.stringify({
      patientId: patient.patientId,
      fromCategory: category
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedPatient(null);
    setDragCategory(null);
  };

  // Handle drop on a category
  const handleDrop = (targetCategory: 'requesting' | 'ready' | 'inUse' | 'discharged') => async (e: React.DragEvent) => {
    e.preventDefault();
    
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    
    try {
      const { patientId, fromCategory } = JSON.parse(data);
      
      // Skip if dropping in the same category
      if (fromCategory === targetCategory) return;
      
      // Update the erStatus in the database
      await request('/api/patients/erStatus', {
        method: 'PUT',
        body: JSON.stringify({
          patientId,
          erStatus: targetCategory
        })
      });
      
      // Update the local state
      setPatients(prev => {
        // Find the patient to move
        const patientToMove = prev[fromCategory as keyof PatientsByCategory].find(
          p => p.patientId === patientId
        );
        
        if (!patientToMove) return prev;
        
        // Create a new state object
        const newState = { ...prev };
        
        // Remove from old category
        newState[fromCategory as keyof PatientsByCategory] = 
          prev[fromCategory as keyof PatientsByCategory].filter(p => p.patientId !== patientId);
          
        // Add to new category
        newState[targetCategory] = [...prev[targetCategory], patientToMove];
        
        return newState;
      });
      
      setNotification(`Patient moved to ${targetCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } catch (err) {
      console.error('Error moving patient:', err);
      setNotification('Failed to move patient');
    }
  };

  // Handle dragover event
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
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
      <List 
        sx={{ width: '100%' }}
        onDrop={handleDrop('requesting')}
        onDragOver={handleDragOver}
      >
        {patients.requesting.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.requesting.map((patient) => (
            <DraggablePatientItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
              draggable
              onDragStart={handleDragStart(patient, 'requesting')}
              onDragEnd={handleDragEnd}
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
            </DraggablePatientItem>
          ))
        )}
      </List>
      
      {/* With an ER Bed Ready */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          With an ER Bed Ready
        </Typography>
      </CategoryHeader>
      <List 
        sx={{ width: '100%' }}
        onDrop={handleDrop('ready')}
        onDragOver={handleDragOver}
      >
        {patients.ready.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.ready.map((patient) => (
            <DraggablePatientItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
              draggable
              onDragStart={handleDragStart(patient, 'ready')}
              onDragEnd={handleDragEnd}
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
            </DraggablePatientItem>
          ))
        )}
      </List>
      
      {/* In an ER Bed */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          In an ER Bed
        </Typography>
      </CategoryHeader>
      <List 
        sx={{ width: '100%' }}
        onDrop={handleDrop('inUse')}
        onDragOver={handleDragOver}
      >
        {patients.inUse.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.inUse.map((patient) => (
            <DraggablePatientItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
              draggable
              onDragStart={handleDragStart(patient, 'inUse')}
              onDragEnd={handleDragEnd}
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
            </DraggablePatientItem>
          ))
        )}
      </List>
      
      {/* Discharged from ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          Discharged from ER
        </Typography>
      </CategoryHeader>
      <List 
        sx={{ width: '100%' }}
        onDrop={handleDrop('discharged')}
        onDragOver={handleDragOver}
      >
        {patients.discharged.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.discharged.map((patient) => (
            <DraggablePatientItem 
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
              draggable
              onDragStart={handleDragStart(patient, 'discharged')}
              onDragEnd={handleDragEnd}
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
            </DraggablePatientItem>
          ))
        )}
      </List>
      
      {/* Add Patient FAB - positioned at bottom right */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddPatient}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        message={notification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default NursePatientsPage; 

