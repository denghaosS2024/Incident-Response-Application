import IIncident from '@/models/Incident'
import { IRequestError } from '@/utils/request'
import {
  DirectionsCar,
  ExpandMore,
  FireExtinguisher,
  Place,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material'
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
} from '@mui/material'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import request from '../../utils/request'
import AlertSnackbar from '../common/AlertSnackbar'
import getRoleIcon from '../common/RoleIcon'

interface Vehicle {
  _id: string
  name: string
  assignedCity: string
}

interface Personnel {
  _id: string
  name: string // Username
  assignedCity: string
  role: 'Fire' | 'Police'
  assignedVehicleTimestamp?: string | null
  assignedCar?: string
  assignedTruck?: string
}

interface CityAssignment {
  cars: Vehicle[]
  trucks: Vehicle[]
  personnel: Personnel[]
}

interface CityAssignmentsContainerProps {
  cityName: string
  data: CityAssignment
  /** Function to refresh data after any assignment changes */
  refreshData: () => void
}

const CityAssignmentsContainer: React.FC<CityAssignmentsContainerProps> = ({
  cityName,
  data,
  refreshData,
}) => {
  const currentUser = localStorage.getItem('username') || ''
  const currentUserPersonnel = data.personnel.find(
    (person) => person.name === currentUser,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [isIncidentCommander, setIsIncidentCommander] = useState<boolean>(false)
  const currentUsername = localStorage.getItem('username')
  const checkIncidentCommander = async () => {
    try {
      const incidents: IIncident[] = await request(
        `/api/incidents?commander=${currentUsername}`,
        {
          method: 'GET',
        },
      )
      const isCommander = incidents.some(
        (incident: IIncident) => incident.commander === currentUsername,
      )
      setIsIncidentCommander(isCommander)
    } catch (error) {
      console.error('Error fetching incidents:', error)
      setIsIncidentCommander(false)
    }
  }

  /**
   * Preselect the vehicle based on current assignment
   * (runs once component mounts or when relevant data changes)
   */
  useEffect(() => {
    if (currentUserPersonnel && currentUserPersonnel.assignedVehicleTimestamp) {
      const assignedVehicleName =
        currentUserPersonnel.role === 'Fire'
          ? data.trucks.find(
              (truck) => truck.name === currentUserPersonnel.assignedTruck,
            )?.name || null
          : currentUserPersonnel.role === 'Police'
            ? data.cars.find(
                (car) => car.name === currentUserPersonnel.assignedCar,
              )?.name || null
            : null

      if (assignedVehicleName) {
        setSelectedVehicle(assignedVehicleName)
      } else {
        setSelectedVehicle(null)
      }
    } else {
      setSelectedVehicle(null)
    }

    checkIncidentCommander()
  }, [currentUserPersonnel, data.cars, data.trucks])

  /**
   * Make a PUT request to /api/personnel/vehicles/release
   * to unassign current user's existing vehicle
   */
  const releaseVehicle = async (vehicleName: string) => {
    try {
      await request('/api/personnel/vehicles/release', {
        method: 'PUT',
        body: JSON.stringify({
          personnelName: currentUser,
          vehicleName,
        }),
      })
      if (currentUserPersonnel?.role === 'Fire') {
        await request('/api/trucks/usernames/release', {
          method: 'PUT',
          body: JSON.stringify({
            truckName: vehicleName,
            username: currentUser,
          }),
        })
      } else if (currentUserPersonnel?.role === 'Police') {
        await request('/api/cars/usernames/release', {
          method: 'PUT',
          body: JSON.stringify({
            carName: vehicleName,
            username: currentUser,
          }),
        })
      }
      // After releasing, refresh
      refreshData()
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Error releasing vehicle:', error)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }
  /**
   * Attempt to assign a new vehicle
   */
  const assignVehicle = async (vehicleName: string) => {
    try {
      let commandingIncident: IIncident | null = null;
      const response = await request(`/api/incidents?commander=${encodeURIComponent(currentUser)}`)
      if (response.length > 0) {
        commandingIncident = response[0];
      }
      let vehicle;
      if (currentUserPersonnel?.role === 'Fire') {
        vehicle = await request(`/api/trucks?name=${encodeURIComponent(vehicleName)}`)
      } else if (currentUserPersonnel?.role === 'Police') {
        vehicle = await request(`/api/cars?name=${encodeURIComponent(vehicleName)}`)
      }
      await request('/api/personnel/vehicles/', {
        method: 'PUT',
        body: JSON.stringify({
          personnelName: currentUser,
          commandingIncident: commandingIncident || null,
          vehicle,
        }),
      })
      if (currentUserPersonnel?.role === 'Fire') {
        await request('/api/trucks/usernames', {
          method: 'PUT',
          body: JSON.stringify({
            truckName: vehicleName,
            username: currentUser,
            commandingIncident: commandingIncident || null,
          }),
        })
      } else if (currentUserPersonnel?.role === 'Police') {
        await request('/api/cars/usernames', {
          method: 'PUT',
          body: JSON.stringify({
            carName: vehicleName,
            username: currentUser,
            commandingIncident: commandingIncident || null,
          }),
        })
      }
      await request('/api/incidents/vehicles', {
        method: 'PUT',
        body: JSON.stringify({
          personnel: currentUserPersonnel,
          commandingIncident: commandingIncident || null,
          vehicle: vehicle,
        }),
      })
      // After assigning, refresh
      refreshData()
      setSelectedVehicle(vehicleName)
    } catch (e) {
      const error = e as IRequestError
      console.log('Error:', error)
      setErrorMessage(`Error: ${error.message}`)
      setOpenSnackbar(true)
    }
  }

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
          : currentUserPersonnel?.assignedCar

      if (assignedVehicle) {
        // Prevent the Incident Commander from deselecting their vehicle
        if (isIncidentCommander) {
          setErrorMessage("As an Incident Commander, you cannot release your assigned vehicle.");
          setOpenSnackbar(true);
          return;
        }
        await releaseVehicle(assignedVehicle)
      }
      return
    }

    // Otherwise, user is assigning a new vehicle
    await assignVehicle(vehicleName)
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          }}
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
                    <Avatar
                      sx={{
                        bgcolor: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {getRoleIcon('Fire')}
                    </Avatar>
                  }
                  sx={{
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  }}
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
                              <Avatar
                                sx={{
                                  bgcolor: 'white',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 0,
                                }}
                              >
                                {getRoleIcon('Fire')}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${person.name}${
                                person.assignedTruck
                                  ? ` ( ${person.assignedTruck} - ${
                                      person.assignedVehicleTimestamp
                                        ? format(
                                            new Date(
                                              person.assignedVehicleTimestamp,
                                            ),
                                            'MM.dd h:mma',
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
                          <Typography sx={{ flexGrow: 1 }}>
                            {truck.name}
                          </Typography>

                          {currentUserPersonnel?.role === 'Fire' &&
                            currentUserPersonnel?.assignedCity === cityName && (
                              <FormControlLabel
                                label=""
                                control={
                                  <Checkbox
                                    checked={selectedVehicle === truck.name}
                                    onChange={() =>
                                      handleVehicleClick(truck.name)
                                    }
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
                    <Avatar
                      sx={{
                        bgcolor: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {getRoleIcon('Police')}
                    </Avatar>
                  }
                  sx={{
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
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
                              <Avatar
                                sx={{
                                  bgcolor: 'white',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: 0,
                                }}
                              >
                                {getRoleIcon('Police')}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${person.name}${
                                person.assignedCar
                                  ? ` ( ${person.assignedCar} - ${
                                      person.assignedVehicleTimestamp
                                        ? format(
                                            new Date(
                                              person.assignedVehicleTimestamp,
                                            ),
                                            'MM.dd h:mma',
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
                          <Typography sx={{ flexGrow: 1 }}>
                            {car.name}
                          </Typography>

                          {currentUserPersonnel?.role === 'Police' &&
                            currentUserPersonnel?.assignedCity === cityName && (
                              <FormControlLabel
                                label=""
                                control={
                                  <Checkbox
                                    checked={selectedVehicle === car.name}
                                    onChange={() =>
                                      handleVehicleClick(car.name)
                                    }
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
      <AlertSnackbar
        open={openSnackbar}
        message={errorMessage || ''}
        onClose={handleCloseSnackbar}
        severity="error"
        vertical="bottom"
        horizontal="center"
      />
    </Box>
  )
}

export default CityAssignmentsContainer
