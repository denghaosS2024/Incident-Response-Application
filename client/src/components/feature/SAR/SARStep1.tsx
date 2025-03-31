import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import styles from '../../../styles/Reach911Page.module.css'
import Map from '../../Map/Mapbox'

import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core'
import { AddressAutofill } from '@mapbox/search-js-react'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IIncident from '../../../models/Incident'
import { updateIncident } from '../../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import eventEmitter from '../../../utils/eventEmitter'
import Globals from '../../../utils/Globals'
import request from '../../../utils/request'
import AlertSnackbar from '../../common/AlertSnackbar'

interface SARStep1Props {
  autoPopulateData?: boolean
  isCreatedByFirstResponder?: boolean
  incidentId?: string
}

interface SARTaskForm {
  name: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  location?: {
    latitude: number
    longitude: number
  }
  address?: string
}

interface SARTaskMarker {
  id: string
  name: string
  status: string
  location?: {
    latitude: number
    longitude: number
  }
  address?: string
  description?: string
}

const SARStep1: React.FC<SARStep1Props> = ({
  autoPopulateData,
  // isCreatedByFirstResponder and incidentId are kept for API compatibility
  // but we're now using the incident from Redux store
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  // Local state for the input field
  const [inputAddress, setInputAddress] = useState(incident.address || '')
  const [inputLocation, setInputLocation] = useState<{ latitude: number; longitude: number } | null>(
    incident.location ? { latitude: incident.location.latitude, longitude: incident.location.longitude } : null
  )
  
  // State for the task creation dialog
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [taskForm, setTaskForm] = useState<SARTaskForm>({
    name: '',
    description: '',
    status: 'todo',
    address: ''
  })
  const [taskInputAddress, setTaskInputAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // State for alert snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success'
  })
  
  // SAR task locations - will be fetched from the backend
  const [sarLocations, setSarLocations] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    address?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }>>([]);

  // Fetch SAR tasks when incident changes
  useEffect(() => {
    if (incident.incidentId) {
      fetchSARTasks(incident.incidentId);
    }
  }, [incident.incidentId]);

  // Function to fetch SAR tasks from the backend
  const fetchSARTasks = async (incidentId: string) => {
    try {
      setIsLoading(true);
      const response = await request(`/api/incidents/${incidentId}/sar-task`, {
        method: 'GET',
      });
      
      console.log('SAR task response:', response);
      
      if (response && Array.isArray(response)) {
        // Convert the tasks from the backend format to our frontend format
        const tasks = response.map((task: any) => ({
          id: task._id || `task-${Math.random().toString(36).substr(2, 9)}`,
          name: task.name || 'Unnamed Task',
          description: task.description || '',
          status: task.state?.toLowerCase() === 'todo' ? 'todo' : 
                 task.state?.toLowerCase() === 'inprogress' ? 'in-progress' : 
                 task.state?.toLowerCase() === 'done' ? 'done' : 'todo',
          address: task.location || '',
          location: task.coordinates || null
        }));
        
        console.log('Processed SAR tasks:', tasks);
        setSarLocations(tasks);
      } else {
        console.log('No SAR tasks found or invalid response format');
        setSarLocations([]);
      }
    } catch (error) {
      console.error('Error fetching SAR tasks:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch SAR tasks',
        severity: 'error'
      });
      setSarLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize address field from location when component loads
  useEffect(() => {
    const hasLocation =
      incident.location?.latitude && incident.location?.longitude;
    const hasAddress = incident.address && incident.address.trim() !== '';

    // If we have a location but no address, get the address from the location
    if (hasLocation && !hasAddress && incident.location) {
      const { latitude, longitude } = incident.location;

      // Access token
      const accessToken = Globals.getMapboxToken();

      // Reverse geocode to get address
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name;
            dispatch(
              updateIncident({
                ...incident,
                address: address,
              }),
            );
            setInputAddress(address);
          }
        })
        .catch((error) => {
          console.error('Error geocoding location:', error);
        });
    }
  }, [incident.location, incident.address, dispatch]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = e.target;
    setInputAddress(value);
  };

  // If a user clicks on a suggestion from the autofill dropdown, we update both input address and location
  function onRetrieve(res: AddressAutofillRetrieveResponse) {
    const newAddress = res.features[0].properties.full_address ?? '';
    const newLocation = {
      longitude: res.features[0].geometry.coordinates[0],
      latitude: res.features[0].geometry.coordinates[1],
    };
    
    // Update the input values
    setInputAddress(newAddress);
    setInputLocation(newLocation);
    
    // Also update the incident in the store
    dispatch(
      updateIncident({
        ...incident,
        location: newLocation,
        address: newAddress,
      }),
    );
  }

  // When user clicks out of the input, we revert it back to the original incident location
  function onBlur() {
    setInputAddress(incident.address);
  }

  // We listen to incident's location changes, and update the text field accordingly. We do this to support manual changes from the map's pin.
  useEffect(() => {
    setInputAddress(incident.address);
    if (incident.location) {
      setInputLocation({
        latitude: incident.location.latitude,
        longitude: incident.location.longitude
      });
    }
  }, [incident.address, incident.location]);

  // Handle opening the task creation dialog
  const handleOpenTaskDialog = () => {
    // Pre-populate the task form with the current incident address and location
    setTaskForm({
      name: '',
      description: '',
      status: 'todo',
      address: inputAddress || '',
      location: inputLocation || undefined
    });
    
    // Set the address input field to match the incident address
    setTaskInputAddress(inputAddress || '');
    
    setOpenTaskDialog(true);
  };

  // Handle closing the task creation dialog
  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
  };
  
  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle text input changes for task form
  const handleTaskTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  // Handle select input changes for task form
  const handleTaskSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  // Handle address input changes for task form
  const handleTaskAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setTaskInputAddress(value);
  };

  // Handle address selection from autofill for task form
  const onTaskAddressRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const newAddress = res.features[0].properties.full_address ?? '';
    const newLocation = {
      longitude: res.features[0].geometry.coordinates[0],
      latitude: res.features[0].geometry.coordinates[1],
    };
    
    // Update both the task form and the input location
    setTaskForm({
      ...taskForm,
      address: newAddress,
    });
    setTaskInputAddress(newAddress);
    setInputLocation(newLocation);
  };

  // When user clicks out of the input, revert to task address
  const onTaskAddressBlur = () => {
    setTaskInputAddress(taskForm.address || '');
  };

  // Map status to backend format
  const mapStatusToBackend = (status: string): 'Todo' | 'InProgress' | 'Done' => {
    switch (status) {
      case 'todo':
        return 'Todo';
      case 'in-progress':
        return 'InProgress';
      case 'done':
        return 'Done';
      default:
        return 'Todo';
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    try {
      if (!taskForm.name) {
        setSnackbar({
          open: true,
          message: 'Task name is required',
          severity: 'error'
        });
        return;
      }
      
      if (!inputLocation) {
        setSnackbar({
          open: true,
          message: 'Task location is required. Please select a location on the map first.',
          severity: 'error'
        });
        return;
      }
      
      if (!incident.incidentId) {
        setSnackbar({
          open: true,
          message: 'No incident ID available',
          severity: 'error'
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Prepare the data for the API
      const sarTaskData = {
        state: mapStatusToBackend(taskForm.status),
        location: inputAddress, // Use inputAddress as per memory requirement
        coordinates: inputLocation ? {
          latitude: inputLocation.latitude,
          longitude: inputLocation.longitude
        } : undefined,
        startDate: new Date().toISOString(),
        name: taskForm.name,
        description: taskForm.description || ''
      };
      
      // Call the API to create the SAR task
      const response = await request(`/api/incidents/${incident.incidentId}/sar-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sarTaskData)
      });
      
      console.log('SAR task created successfully:', response);
      
      // Add the new task to the local state
      const newTask = {
        id: `task${sarLocations.length + 1}`,
        name: taskForm.name,
        status: taskForm.status,
        address: taskForm.address,
        description: taskForm.description || ''
      };
      
      const updatedLocations = [...sarLocations, newTask];
      setSarLocations(updatedLocations);
      
      // Close the dialog and show success message
      setOpenTaskDialog(false);
      setSnackbar({
        open: true,
        message: 'SAR task created successfully',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error creating task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create task',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    eventEmitter.on('map_loaded', () => {});
  }, []);

  // Listen for map clicks to get the selected location
  useEffect(() => {
    const handleMapClick = (location: { latitude: number; longitude: number }) => {
      console.log('Map clicked at:', location);
      
      // Update the inputLocation directly
      setInputLocation({
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      // Get the address from the coordinates
      const accessToken = Globals.getMapboxToken();
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?access_token=${accessToken}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name;
            // Update the inputAddress with the new address
            setInputAddress(address);
          }
        })
        .catch((error) => {
          console.error('Error geocoding location:', error);
          // Still update the inputLocation even if geocoding fails
          setInputLocation({
            latitude: location.latitude,
            longitude: location.longitude
          });
        });
    };

    eventEmitter.on('map_clicked', handleMapClick);

    return () => {
      eventEmitter.removeListener('map_clicked', handleMapClick);
    };
  }, [incident, dispatch]);

  // Handle task click to update input location and address
  const handleTaskClick = (task: any) => {
    if (task.location && task.location.latitude && task.location.longitude) {
      // Update the input location with the task's location
      setInputLocation({
        latitude: task.location.latitude,
        longitude: task.location.longitude
      });
      
      // If the task has an address, update the input address
      if (task.address) {
        setInputAddress(task.address);
      } else {
        // If no address, try to get one from the coordinates
        const accessToken = Globals.getMapboxToken();
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${task.location.longitude},${task.location.latitude}.json?access_token=${accessToken}`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name;
              setInputAddress(address);
            }
          })
          .catch((error) => {
            console.error('Error geocoding location:', error);
          });
      }
      
      // Show a success message
      setSnackbar({
        open: true,
        message: 'Location updated from selected task',
        severity: 'success'
      });
    } else {
      // Show an error message if the task doesn't have location data
      setSnackbar({
        open: true,
        message: 'No location data available for this task',
        severity: 'warning'
      });
    }
  };

  return (
    <div className={styles.wrapperStep1}>
      <div className={styles.flexCenterColumn}>
        <Typography variant="h5" align="center" gutterBottom>
          Search and Rescue (SAR) Incident
        </Typography>
        
        {incident.incidentId && (
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              py: 1,
              px: 2,
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            Incident ID: {incident.incidentId}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Chip 
            icon={<HomeIcon style={{ color: '#f44336' }} />} 
            label="Todo" 
            color="default" 
            variant="outlined" 
          />
          <Chip 
            icon={<HomeIcon style={{ color: '#2196f3' }} />} 
            label="In Progress" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<CheckCircleIcon style={{ color: '#4caf50' }} />} 
            label="Done" 
            color="success" 
            variant="outlined" 
          />
        </Box>

        <Typography
          variant="subtitle1"
          className={styles.bold}
          align="center"
          gutterBottom
        >
          SAR Operations Map - Current Tasks and Last Known Location:
        </Typography>
        
        {/* Create Task Button - Available to all users */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenTaskDialog}
          >
            Create New Task
          </Button>
        </Box>
        
        <div className={styles.flexCenter}>
          <Box
            sx={{
              width: { xs: '90%', sm: '90%', md: '90%', lg: '90%' },
              maxWidth: '900px',
            }}
          >
            <form>
              <AddressAutofill
                onRetrieve={onRetrieve}
                options={{ streets: false }}
                accessToken={Globals.getMapboxToken()}
              >
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Last Known Location or Search Area"
                  variant="outlined"
                  value={inputAddress}
                  autoComplete="street-address"
                  onBlur={onBlur}
                  onChange={(e) => onChange(e)}
                />
              </AddressAutofill>
            </form>
          </Box>
        </div>
      </div>
      <div className={styles.flexCenter}>
        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
            height: { xs: '400px', sm: '500px', md: '500px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            mt: 2,
            mx: 'auto',
            mb: 2,
            position: 'relative',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6">Loading SAR tasks...</Typography>
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <LocationOnIcon color="error" />
            <Typography variant="body2" align="center">
              Map shows SAR tasks and last known locations
            </Typography>
          </Box>
          <div
            className={styles.flexCenter}
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              minHeight: '400px', // Ensure minimum height for the map
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                position: 'relative',
                margin: 0,
                padding: 0,
              }}
            >
              <Map
                autoPopulateData={autoPopulateData}
                showMarker={false}
                disableGeolocation={false}
              />
            </div>
          </div>
        </Box>
      </div>

      {/* Display SAR locations/tasks list */}
      <Box sx={{ width: '90%', maxWidth: '900px', mx: 'auto', mt: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          SAR Tasks
        </Typography>
        {sarLocations.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              mb: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor:
                task.status === 'done'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : task.status === 'in-progress'
                  ? 'rgba(33, 150, 243, 0.1)'
                  : 'white',
              cursor: 'pointer', // Add pointer cursor to indicate clickability
            }}
            onClick={() => handleTaskClick(task)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {task.status === 'done' ? (
                <CheckCircleIcon style={{ color: '#4caf50' }} />
              ) : task.status === 'in-progress' ? (
                <HomeIcon style={{ color: '#2196f3' }} />
              ) : (
                <HomeIcon style={{ color: '#f44336' }} />
              )}
              <Typography variant="body1">{task.name}</Typography>
            </Box>
            <Chip
              label={
                task.status === 'todo'
                  ? 'To Do'
                  : task.status === 'in-progress'
                  ? 'In Progress'
                  : 'Done'
              }
              color={
                task.status === 'done'
                  ? 'success'
                  : task.status === 'in-progress'
                  ? 'primary'
                  : 'default'
              }
              size="small"
            />
          </Box>
        ))}
      </Box>

      {/* Task Creation Dialog */}
      <Dialog open={openTaskDialog} onClose={handleCloseTaskDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New SAR Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Task Name"
            type="text"
            fullWidth
            variant="outlined"
            value={taskForm.name}
            onChange={handleTaskTextChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={taskForm.description}
            onChange={handleTaskTextChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={taskForm.status}
              label="Status"
              onChange={handleTaskSelectChange}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Task Location
          </Typography>
          
          {inputLocation && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Location selected: {inputLocation.latitude.toFixed(6)}, {inputLocation.longitude.toFixed(6)}
              </Typography>
            </Box>
          )}
          
          <AddressAutofill
            onRetrieve={onTaskAddressRetrieve}
            options={{ streets: false }}
            accessToken={Globals.getMapboxToken()}
          >
            <TextField
              fullWidth
              label="Task Location"
              variant="outlined"
              value={taskInputAddress}
              autoComplete="street-address"
              onBlur={onTaskAddressBlur}
              onChange={handleTaskAddressChange}
              required
              disabled={true} // Disable the field as per memory requirement
              sx={{ mb: 2 }}
              helperText={inputLocation ? "Using input location" : "Please select a location first"}
            />
          </AddressAutofill>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTask} 
            color="primary" 
            variant="contained"
            disabled={isSubmitting || !taskForm.name || !taskForm.address}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <AlertSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default SARStep1;
