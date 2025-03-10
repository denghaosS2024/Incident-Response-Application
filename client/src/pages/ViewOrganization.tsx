import {
  Directions,
  DirectionsCar,
  ExpandMore,
  FireExtinguisher,
  LocalPolice,
  Place,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

// Interfaces for data models
interface Car {
  _id: string
  name: string
}

interface Truck {
  _id: string
  name: string
}

interface City {
  _id: string
  name: string
}

interface Personnel {
  _id: string
  username: string
  role: 'Fire' | 'Police' | 'Dispatch'
  assignedCity?: string
  assignedVehicle?: string
  badge?: string
  assignmentTimestamp?: string
}

interface VehicleAssignment {
  personnelId: string
  vehicleId: string
  vehicleType: 'car' | 'truck'
}

const ViewOrganization: React.FC = () => {
  // State management
  const [cars, setCars] = useState<Car[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null)

  // Vehicle assignment dialog states
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    // Get current user's role from localStorage
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId') // Assuming you store user ID in localStorage
    setUserRole(role)
    setUserId(userId)

    // Load all organization data
    fetchOrganizationData()
  }, [])

  // Find current user in personnel
  useEffect(() => {
    if (userId && personnel.length > 0) {
      const user = personnel.find((p) => p._id === userId)
      if (user) {
        setCurrentUser(user)
      }
    }
  }, [userId, personnel])

  const fetchOrganizationData = async () => {
    try {
      // Fetch personnel data
      const personResponse = await fetch('/api/personnel')
      if (personResponse.ok) {
        const personData: Personnel[] = await personResponse.json()
        setPersonnel(personData)
      }

      // Fetch cars data
      const carsResponse = await fetch('/api/cars')
      if (carsResponse.ok) {
        const carsData: Car[] = await carsResponse.json()
        setCars(carsData)
      }

      // Fetch trucks data
      const trucksResponse = await fetch('/api/trucks')
      if (trucksResponse.ok) {
        const trucksData: Truck[] = await trucksResponse.json()
        setTrucks(trucksData)
      }

      // Fetch cities data
      const citiesResponse = await fetch('/api/cities')
      if (citiesResponse.ok) {
        const citiesData: City[] = await citiesResponse.json()
        setCities(citiesData)
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
    }
  }

  // Open the vehicle selection dialog for a specific city
  const handleOpenVehicleDialog = (city: City) => {
    setSelectedCity(city)
    setVehicleDialogOpen(true)
  }

  // Close the vehicle selection dialog
  const handleCloseVehicleDialog = () => {
    setVehicleDialogOpen(false)
    setSelectedVehicleId('')
    setSelectedCity(null)
  }

  // Submit vehicle selection
  const handleSelectVehicle = async () => {
    if (!selectedVehicleId || !userId) return

    try {
      // Determine if we're assigning a car or a truck based on user role
      const vehicleType = userRole === 'Police' ? 'car' : 'truck'

      const assignment: VehicleAssignment = {
        personnelId: userId,
        vehicleId: selectedVehicleId,
        vehicleType,
      }

      // Send assignment to backend
      const response = await fetch('/api/vehicle-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      })

      if (response.ok) {
        // Create timestamp
        const timestamp = format(new Date(), 'MM.dd h:mma')

        // Update local state to reflect the change
        setPersonnel((prevPersonnel) =>
          prevPersonnel.map((person) =>
            person._id === userId
              ? {
                  ...person,
                  assignedVehicle: selectedVehicleId,
                  assignmentTimestamp: timestamp,
                }
              : person,
          ),
        )

        // Close the dialog
        handleCloseVehicleDialog()

        // Refresh data
        fetchOrganizationData()
      } else {
        console.error('Failed to assign vehicle:', response.statusText)
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error)
    }
  }

  // Helper function to get vehicle name by ID
  const getVehicleName = (
    vehicleId: string | undefined,
    vehicleType: 'car' | 'truck',
  ): string => {
    if (!vehicleId) return 'None'

    if (vehicleType === 'car') {
      const car = cars.find((c) => c._id === vehicleId)
      return car ? car.name : 'Unknown Car'
    } else {
      const truck = trucks.find((t) => t._id === vehicleId)
      return truck ? truck.name : 'Unknown Truck'
    }
  }

  // Helper function to get city name by ID
  const getCityName = (cityId: string | undefined): string => {
    if (!cityId) return 'Not Assigned'
    const city = cities.find((c) => c._id === cityId)
    return city ? city.name : 'Unknown City'
  }

  // Determine if the user can select a vehicle based on their role
  const canSelectVehicle =
    (userRole === 'Police' || userRole === 'Fire') && userId

  // Group personnel by city for easier rendering
  const personnelByCity = cities.map((city) => ({
    city,
    police: personnel.filter(
      (p) => p.role === 'Police' && p.assignedCity === city._id,
    ),
    fire: personnel.filter(
      (p) => p.role === 'Fire' && p.assignedCity === city._id,
    ),
    dispatch: personnel.filter(
      (p) => p.role === 'Dispatch' && p.assignedCity === city._id,
    ),
  }))

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Organization Chart
      </Typography>

      {/* Display user's current assignment if applicable */}
      {canSelectVehicle && currentUser && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6">Your Assignment</Typography>
            <Typography variant="body1">
              Location: {getCityName(currentUser.assignedCity)}
            </Typography>
            {currentUser.assignedVehicle && (
              <Typography variant="body1">
                Vehicle:{' '}
                {getVehicleName(
                  currentUser.assignedVehicle,
                  userRole === 'Police' ? 'car' : 'truck',
                )}
                {currentUser.assignmentTimestamp && (
                  <Typography
                    component="span"
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    (assigned: {currentUser.assignmentTimestamp})
                  </Typography>
                )}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location-Based Grouping */}
      {personnelByCity.map(({ city, police, fire, dispatch }) => (
        <Accordion key={city._id} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Place />
              <Typography variant="h6">{city.name}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Fire Department */}
              {fire.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardHeader
                      title="Fire Department"
                      avatar={
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <FireExtinguisher />
                        </Avatar>
                      }
                      sx={{
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      }}
                    />
                    <CardContent>
                      <List>
                        {fire.map((firefighter) => (
                          <ListItem
                            key={firefighter._id}
                            sx={{ borderBottom: '1px solid #eee', py: 2 }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'error.main' }}>
                                <FireExtinguisher />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 'bold' }}>
                                  {firefighter.username}
                                  {firefighter.assignedVehicle &&
                                    firefighter.assignmentTimestamp && (
                                      <Typography
                                        component="span"
                                        sx={{ fontWeight: 'normal', ml: 1 }}
                                      >
                                        (
                                        {getVehicleName(
                                          firefighter.assignedVehicle,
                                          'truck',
                                        )}{' '}
                                        – {firefighter.assignmentTimestamp})
                                      </Typography>
                                    )}
                                </Typography>
                              }
                              secondary={
                                firefighter.badge
                                  ? `Badge: ${firefighter.badge}`
                                  : undefined
                              }
                            />

                            {/* Vehicle Assignment for current user */}
                            {userId === firefighter._id &&
                              userRole === 'Fire' && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleOpenVehicleDialog(city)}
                                >
                                  Assign Truck
                                </Button>
                              )}
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Police Department */}
              {police.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardHeader
                      title="Police Department"
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <LocalPolice />
                        </Avatar>
                      }
                      sx={{
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    />
                    <CardContent>
                      <List>
                        {police.map((officer) => (
                          <ListItem
                            key={officer._id}
                            sx={{ borderBottom: '1px solid #eee', py: 2 }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <DirectionsCar />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 'bold' }}>
                                  {officer.username}
                                  {officer.assignedVehicle &&
                                    officer.assignmentTimestamp && (
                                      <Typography
                                        component="span"
                                        sx={{ fontWeight: 'normal', ml: 1 }}
                                      >
                                        (
                                        {getVehicleName(
                                          officer.assignedVehicle,
                                          'car',
                                        )}{' '}
                                        – {officer.assignmentTimestamp})
                                      </Typography>
                                    )}
                                </Typography>
                              }
                              secondary={
                                officer.badge
                                  ? `Badge: ${officer.badge}`
                                  : undefined
                              }
                            />

                            {/* Vehicle Assignment for current user */}
                            {userId === officer._id &&
                              userRole === 'Police' && (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenVehicleDialog(city)}
                                >
                                  Assign Car
                                </Button>
                              )}
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Dispatch */}
              {dispatch.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardHeader
                      title="Dispatch"
                      avatar={
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <Directions />
                        </Avatar>
                      }
                      sx={{
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText',
                      }}
                    />
                    <CardContent>
                      <List>
                        {dispatch.map((dispatcher) => (
                          <ListItem
                            key={dispatcher._id}
                            sx={{ borderBottom: '1px solid #eee', py: 2 }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <Directions />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: 'bold' }}>
                                  {dispatcher.username}
                                </Typography>
                              }
                              secondary={
                                dispatcher.badge
                                  ? `Badge: ${dispatcher.badge}`
                                  : undefined
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Show message if no personnel assigned to this location */}
              {police.length === 0 &&
                fire.length === 0 &&
                dispatch.length === 0 && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ p: 2, textAlign: 'center' }}
                    >
                      No personnel assigned to this location
                    </Typography>
                  </Grid>
                )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Vehicle Assignment Dialog with Radio Buttons */}
      <Dialog
        open={vehicleDialogOpen}
        onClose={handleCloseVehicleDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {userRole === 'Police'
            ? 'Select Your Police Car'
            : 'Select Your Fire Truck'}
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
            <RadioGroup
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              {userRole === 'Police'
                ? cars.map((car) => (
                    <FormControlLabel
                      key={car._id}
                      value={car._id}
                      control={<Radio />}
                      label={car.name}
                    />
                  ))
                : trucks.map((truck) => (
                    <FormControlLabel
                      key={truck._id}
                      value={truck._id}
                      control={<Radio />}
                      label={truck.name}
                    />
                  ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVehicleDialog}>Cancel</Button>
          <Button
            onClick={handleSelectVehicle}
            variant="contained"
            color="primary"
            disabled={!selectedVehicleId}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ViewOrganization
