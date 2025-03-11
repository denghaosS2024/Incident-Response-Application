import {
  DirectionsCar,
  ExpandMore,
  FireExtinguisher,
  LocalPolice,
  Place,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

interface Vehicle {
  _id: string;
  name: string;
  assignedCity: string;
}

interface Personnel {
  _id: string;
  name: string; // Username
  assignedCity: string;
  role: 'Fire' | 'Police';
  assignedVehicleTimestamp?: string | null;
  assignedCar?: string;
  assignedTruck?: string;
}

interface CityAssignment {
  cars: Vehicle[];
  trucks: Vehicle[];
  personnel: Personnel[];
}

interface CityAssignmentsContainerProps {
  cityName: string;
  data: CityAssignment;
  /** Function to refresh data after any assignment changes */
  refreshData: () => void;
}

const CityAssignmentsContainer: React.FC<CityAssignmentsContainerProps> = ({
  cityName,
  data,
  refreshData,
}) => {
  const currentUser = localStorage.getItem('username') || '';
  const currentUserPersonnel = data.personnel.find((person) => person.name === currentUser);

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  /**
   * Preselect the vehicle based on current assignment
   * (runs once component mounts or when relevant data changes)
   */
  useEffect(() => {
    if (currentUserPersonnel && currentUserPersonnel.assignedVehicleTimestamp) {
      const assignedVehicleName =
        currentUserPersonnel.role === 'Fire'
          ? data.trucks.find((truck) => truck.name === currentUserPersonnel.assignedTruck)?.name ||
          null
          : currentUserPersonnel.role === 'Police'
            ? data.cars.find((car) => car.name === currentUserPersonnel.assignedCar)?.name || null
            : null;

      if (assignedVehicleName) {
        setSelectedVehicle(assignedVehicleName);
      } else {
        setSelectedVehicle(null);
      }
    } else {
      setSelectedVehicle(null);
    }
  }, [currentUserPersonnel, data.cars, data.trucks]);

  /**
   * Make a PUT request to /api/personnel/vehicles/release
   * to unassign current user's existing vehicle
   */
  const releaseVehicle = async (vehicleName: string) => {
    try {
      const response = await fetch('/api/personnel/vehicles/release', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelName: currentUser,
          vehicleName,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to release vehicle');
      }
      // After releasing, refresh
      refreshData();
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error releasing vehicle:', error);
    }
  };

  /**
   * Attempt to assign a new vehicle
   */
  const assignVehicle = async (vehicleName: string) => {
    try {
      const response = await fetch('/api/personnel/vehicles/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelName: currentUser,
          vehicleName,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update vehicle assignment');
      }
      // After assigning, refresh
      refreshData();
      setSelectedVehicle(vehicleName);
    } catch (error) {
      console.error('Error assigning vehicle:', error);
    }
  };

  /**
   * Single function to handle user clicking a vehicle (truck or car).
   * - If it's the same as currently selected, we "release" it (deselect).
   * - Otherwise, we assign it.
   */
  const handleVehicleClick = async (vehicleName: string) => {
    // If user clicks on the already-selected vehicle, unselect it
    if (vehicleName === selectedVehicle) {
      const assignedVehicle =
        currentUserPersonnel?.role === 'Fire'
          ? currentUserPersonnel?.assignedTruck
          : currentUserPersonnel?.assignedCar;

      if (assignedVehicle) {
        await releaseVehicle(assignedVehicle);
      }
      return;
    }

    // Otherwise, user is assigning a new vehicle
    await assignVehicle(vehicleName);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Place />
            <Typography variant="h6">{cityName}</Typography>
            <Typography variant="caption" sx={{ ml: 2 }}>
              ({data.personnel.length} personnel)
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Fire Department Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title="Fire Department"
                  avatar={
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <FireExtinguisher />
                    </Avatar>
                  }
                  sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }}
                />
                <CardContent>
                  <Typography variant="h6">Personnel</Typography>
                  {data.personnel.some((p) => p.role === 'Fire') ? (
                    <List>
                      {data.personnel
                        .filter((p) => p.role === 'Fire')
                        .map((person) => (
                          <ListItem key={person._id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'error.main' }}>
                                <FireExtinguisher />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${person.name}${person.assignedTruck
                                  ? ` ( ${person.assignedTruck} - ${person.assignedVehicleTimestamp
                                    ? format(
                                      new Date(person.assignedVehicleTimestamp),
                                      'MM.dd h:mma'
                                    )
                                    : 'N/A'
                                  } )`
                                  : ''
                                }`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No fire personnel assigned.
                    </Typography>
                  )}

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Trucks
                  </Typography>
                  {data.trucks.length > 0 ? (
                    <List>
                      {data.trucks.map((truck) => (
                        <ListItem key={truck._id}>
                          <FireExtinguisher color="error" sx={{ mr: 1 }} />
                          <Typography sx={{ flexGrow: 1 }}>{truck.name}</Typography>

                          {currentUserPersonnel?.role === 'Fire' &&
                            currentUserPersonnel?.assignedCity === cityName && (
                              <FormControlLabel
                                label=""
                                control={
                                  <Checkbox
                                    checked={selectedVehicle === truck.name}
                                    onChange={() => handleVehicleClick(truck.name)}
                                    icon={<RadioButtonUnchecked />}
                                    checkedIcon={<RadioButtonChecked />}
                                  />
                                }
                              />
                            )}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No fire trucks available.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Police Department Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardHeader
                  title="Police Department"
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <LocalPolice />
                    </Avatar>
                  }
                  sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
                />
                <CardContent>
                  <Typography variant="h6">Personnel</Typography>
                  {data.personnel.some((p) => p.role === 'Police') ? (
                    <List>
                      {data.personnel
                        .filter((p) => p.role === 'Police')
                        .map((person) => (
                          <ListItem key={person._id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <LocalPolice />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${person.name}${person.assignedCar
                                  ? ` ( ${person.assignedCar} - ${person.assignedVehicleTimestamp
                                    ? format(
                                      new Date(person.assignedVehicleTimestamp),
                                      'MM.dd h:mma'
                                    )
                                    : 'N/A'
                                  } )`
                                  : ''
                                }`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No police personnel assigned.
                    </Typography>
                  )}

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Cars
                  </Typography>
                  {data.cars.length > 0 ? (
                    <List>
                      {data.cars.map((car) => (
                        <ListItem key={car._id}>
                          <DirectionsCar color="primary" sx={{ mr: 1 }} />
                          <Typography sx={{ flexGrow: 1 }}>{car.name}</Typography>

                          {currentUserPersonnel?.role === 'Police' &&
                            currentUserPersonnel?.assignedCity === cityName && (
                              <FormControlLabel
                                label=""
                                control={
                                  <Checkbox
                                    checked={selectedVehicle === car.name}
                                    onChange={() => handleVehicleClick(car.name)}
                                    icon={<RadioButtonUnchecked />}
                                    checkedIcon={<RadioButtonChecked />}
                                  />
                                }
                              />
                            )}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      No police cars available.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CityAssignmentsContainer;
