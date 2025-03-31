import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useMediaQuery, Alert } from '@mui/material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from '@mui/material';
import AlertSnackbar from '@/components/common/AlertSnackbar';
import IIncident from '@/models/Incident';
import request from '../utils/request';
import VehicleList from '@/components/AllocateResource/VehicleList';
import IncidentList from '@/components/AllocateResource/IncidentList';

// Interfaces representing the backend data
interface Car {
  assignedCity: string;
  _id: string;
  name: string;
  usernames: string[];
  assignedIncident: string;
}

interface Truck {
  assignedCity: string;
  _id: string;
  name: string;
  usernames: string[];
  assignedIncident: string;
}

const ResourcesPage: React.FC = () => {
  // State management
  const [cars, setCars] = useState<Car[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  
  // For responsive layout
  const isMobile = useMediaQuery('(max-width:600px)');

  // Fetch data from backend
  const fetchAllData = async () => {
    try {
      const [carsData, trucksData, incidentData] = await Promise.all([
        request<Car[]>('/api/cars/availability'),
        request<Truck[]>('/api/trucks/availability'),
        request<IIncident[]>('/api/incidents'),
      ]);

      setCars(carsData);
      setTrucks(trucksData);
      setIncidents(incidentData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  // Drag and drop logic
  // const onDragEnd = async (result: DropResult) => {
  //   const { source, destination, draggableId } = result;
  //   if (!destination) return;
  //   if (
  //     source.droppableId === destination.droppableId &&
  //     source.index === destination.index
  //   ) {
  //     return;
  //   }
    
  //   const [itemType, itemName] = draggableId.split('::');
  //   const destDroppable = destination.droppableId;
  //   const currentUsername: string | null = localStorage.getItem('username');
    
  //   if (destDroppable.startsWith('incident-')) {
  //     const incidentId = destDroppable.replace('incident-', '');
  //     try {
  //       const currentIncident: IIncident | undefined = incidents.find(
  //         (inc) => inc.incidentId === incidentId,
  //       );
        
  //       if (!currentIncident) {
  //         setErrorMessage('Incident not found');
  //         setOpenSnackbar(true);
  //         return;
  //       } else if (currentIncident.commander !== currentUsername) {
  //         setErrorMessage('You are not the commander of this incident');
  //         setOpenSnackbar(true);
  //         return;
  //       }

  //       const isDuplicate = currentIncident.assignedVehicles.some(
  //         (v) => v.name === itemName && v.type === itemType,
  //       );

  //       if (isDuplicate) {
  //         setErrorMessage('Vehicle already assigned to this incident');
  //         setOpenSnackbar(true);
  //         return;
  //       }

  //       const matchingVehicle =
  //         itemType === 'Car'
  //           ? cars.find((car) => car.name === itemName)
  //           : trucks.find((truck) => truck.name === itemName);

  //       // Prepare the updated incident with the new vehicle
  //       const updatedIncident: IIncident = {
  //         ...currentIncident,
  //         assignedVehicles: [
  //           ...currentIncident.assignedVehicles,
  //           {
  //             type: itemType,
  //             name: itemName,
  //             usernames: matchingVehicle?.usernames || [],
  //           },
  //         ],
  //       };

  //       // Update the local state immediately for responsiveness
  //       setIncidents((prevIncidents) =>
  //         prevIncidents.map((inc) =>
  //           inc.incidentId === incidentId ? updatedIncident : inc,
  //         ),
  //       );

  //       if (itemType === 'Car') {
  //         setCars((prevCars) => prevCars.filter((car) => car.name !== itemName));
  //       } else if (itemType === 'Truck') {
  //         setTrucks((prevTrucks) =>
  //           prevTrucks.filter((truck) => truck.name !== itemName),
  //         );
  //       }
  //     } catch (e: any) {
  //       if (e.message && e.message.includes('Unexpected end of JSON input')) {
  //         // Fix for Lint error - can add proper handling here if needed
  //       } else {
  //         console.error('Error assigning item to incident:', e);
  //       }
  //     }
  //   }
  // };
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
  
    const [itemType, itemName] = draggableId.split('::');
    const destDroppable = destination.droppableId;
    const sourceDroppable = source.droppableId;
    const currentUsername: string | null = localStorage.getItem('username');
  
    if (destDroppable.startsWith('incident-')) {
      const incidentId = destDroppable.replace('incident-', '');
      try {
        const currentIncident = incidents.find((inc) => inc.incidentId === incidentId);
  
        if (!currentIncident) {
          setErrorMessage('Incident not found');
          setOpenSnackbar(true);
          return;
        } else if (currentIncident.commander !== currentUsername) {
          setErrorMessage('You are not the commander of this incident');
          setOpenSnackbar(true);
          return;
        }
  
        const isDuplicate = currentIncident.assignedVehicles.some(
          (v) => v.name === itemName && v.type === itemType,
        );
  
        if (isDuplicate) {
          setErrorMessage('Vehicle already assigned to this incident');
          setOpenSnackbar(true);
          return;
        }
  
        const matchingVehicle =
          itemType === 'Car'
            ? cars.find((car) => car.name === itemName)
            : trucks.find((truck) => truck.name === itemName);
  
        const updatedIncident: IIncident = {
          ...currentIncident,
          assignedVehicles: [
            ...currentIncident.assignedVehicles,
            {
              type: itemType,
              name: itemName,
              usernames: matchingVehicle?.usernames || [],
            },
          ],
        };
  
        setIncidents((prevIncidents) =>
          prevIncidents.map((inc) =>
            inc.incidentId === incidentId ? updatedIncident : inc,
          ),
        );
  
        if (itemType === 'Car') {
          setCars((prevCars) => prevCars.filter((car) => car.name !== itemName));
        } else if (itemType === 'Truck') {
          setTrucks((prevTrucks) => prevTrucks.filter((truck) => truck.name !== itemName));
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Unexpected end of JSON input')) {
          // Fix for Lint error - can add proper handling here if needed
        } else {
          console.error('Error assigning item to incident:', e);
        }
      }
    }
  
    // Handle dragging resource BACK to list
    else if (destDroppable === 'cars' || destDroppable === 'trucks') {
      const incidentId = sourceDroppable.replace('incident-', '');
      const currentIncident = incidents.find((inc) => inc.incidentId === incidentId);
      if (!currentIncident) return;
    
      const removedVehicle = currentIncident.assignedVehicles.find(
        (v) => v.name === itemName && v.type === itemType,
      );
      if (!removedVehicle) return;
    
      const updatedVehicles = currentIncident.assignedVehicles.filter(
        (v) => !(v.name === itemName && v.type === itemType),
      );
    
      const updatedIncident: IIncident = {
        ...currentIncident,
        assignedVehicles: updatedVehicles,
      };

      console.log(updatedIncident)
    
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) =>
          inc.incidentId === incidentId ? updatedIncident : inc,
        ),
      );
    
      if (itemType === 'Car') {
        setCars((prevCars) => [...prevCars, removedVehicle as Car]);
      } else if (itemType === 'Truck') {
        setTrucks((prevTrucks) => [...prevTrucks, removedVehicle as Truck]);
      }
    }
  };
  

  const onSubmit = async () => {
    try{
      const currentUsername = localStorage.getItem('username');
      if (!currentUsername) return;
      const myIncidents = incidents.filter(
        (incident) => incident.commander === currentUsername
      );
      await request('/api/incidents/updatedVehicles', {
        method: 'PUT',
        body: JSON.stringify({ incidents: [myIncidents] }),
      });

      setSuccessMessage("Submit Successfully!");
      setOpenSuccessSnackbar(true);
    }catch(e){
      console.log(e)
    }
  } 

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>

      <Typography variant="h6" align="center" className="mb-4">
        Drag & drop resources:
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box className="row">
          {/* LEFT SIDE: VEHICLES (CARS & TRUCKS) */}
          <div className="col-12 col-md-4 mb-3">
            <Card className="shadow-sm">
              <CardContent>
                <Typography variant="h5" style={{ marginTop: 16 }}>
                  Vehicles
                </Typography>
                
                {/* Cars component */}
                <VehicleList 
                  title="Cars" 
                  vehicles={cars} 
                  droppableId="cars"
                  vehicleType="Car"
                />
                
                {/* Trucks component */}
                <VehicleList 
                  title="Trucks" 
                  vehicles={trucks} 
                  droppableId="trucks"
                  vehicleType="Truck"
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: Incidents */}
          <div className="col-12 col-md-8 mb-3">
            <IncidentList incidents={incidents} />
          </div>
        </Box>
      </DragDropContext>
      
      <AlertSnackbar
        open={openSnackbar}
        message={errorMessage || ''}
        onClose={handleCloseSnackbar}
        severity="error"
        vertical="bottom"
        horizontal="center"
      />

      <AlertSnackbar
        open={openSuccessSnackbar}
        message={successMessage || ''}
        onClose={handleCloseSuccessSnackbar}
        severity="success"
        vertical="bottom"
        horizontal="center"
      />
      
      {/* SUBMIT & CANCEL BUTTONS */}
      <Typography align="center" className="mb-4" style={{ marginTop: '20px' }}>
        <Button type="submit" variant="contained" color="primary" onClick={onSubmit}>
          Submit
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="inherit"
          onClick={() => fetchAllData()}
        >
          Cancel
        </Button>
      </Typography>
    </div>
  );
};

export default ResourcesPage;