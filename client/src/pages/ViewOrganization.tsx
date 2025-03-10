import { Directions, FireTruck, LocalPolice, Person } from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
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
}

interface VehicleAssignment {
  personnelId: string
  vehicleId: string
  vehicleType: 'car' | 'truck'
}

const ViewOrganization: React.FC = () => {
  // State management
  const [tabValue, setTabValue] = useState(0)
  const [cars, setCars] = useState<Car[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null)

  // Dialog states for vehicle selection
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Open the vehicle selection dialog
  const handleOpenVehicleDialog = () => {
    setVehicleDialogOpen(true)
  }

  // Close the vehicle selection dialog
  const handleCloseVehicleDialog = () => {
    setVehicleDialogOpen(false)
    setSelectedVehicleId('')
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
        // Update local state to reflect the change
        setPersonnel((prevPersonnel) =>
          prevPersonnel.map((person) =>
            person._id === userId
              ? { ...person, assignedVehicle: selectedVehicleId }
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

  // Group personnel by city
  const policeByCity = cities.map((city) => ({
    city,
    personnel: personnel.filter(
      (p) => p.role === 'Police' && p.assignedCity === city._id,
    ),
  }))

  const fireByCity = cities.map((city) => ({
    city,
    personnel: personnel.filter(
      (p) => p.role === 'Fire' && p.assignedCity === city._id,
    ),
  }))

  const dispatchByCity = cities.map((city) => ({
    city,
    personnel: personnel.filter(
      (p) => p.role === 'Dispatch' && p.assignedCity === city._id,
    ),
  }))

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

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Organization Chart
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab icon={<LocalPolice />} label="Police" />
        <Tab icon={<FireTruck />} label="Fire" />
        <Tab icon={<Directions />} label="Dispatch" />
      </Tabs>

      {/* User's vehicle selection (if applicable) */}
      {canSelectVehicle && (
        <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6">
                Your Assignment: {getCityName(currentUser?.assignedCity)}
              </Typography>
              <Typography>
                Your Vehicle:{' '}
                {getVehicleName(
                  currentUser?.assignedVehicle,
                  userRole === 'Police' ? 'car' : 'truck',
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenVehicleDialog}
                startIcon={
                  userRole === 'Police' ? <LocalPolice /> : <FireTruck />
                }
              >
                Select {userRole === 'Police' ? 'Car' : 'Truck'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Police Organization Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Police Department Organization
          </Typography>

          {policeByCity.map(({ city, personnel }) => (
            <Card key={city._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {city.name} Police
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {personnel.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No police officers assigned to this city
                  </Typography>
                ) : (
                  <List>
                    {personnel.map((officer) => (
                      <ListItem key={officer._id}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          badgeContent={
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                bgcolor: 'primary.main',
                              }}
                            >
                              <LocalPolice sx={{ fontSize: 12 }} />
                            </Avatar>
                          }
                        >
                          <Avatar sx={{ bgcolor: 'blue.main', mr: 2 }}>
                            <Person />
                          </Avatar>
                        </Badge>
                        <ListItemText
                          primary={officer.username}
                          secondary={`Badge: ${officer.badge || 'N/A'}`}
                        />
                        {officer.assignedVehicle && (
                          <Chip
                            icon={<LocalPolice />}
                            label={getVehicleName(
                              officer.assignedVehicle,
                              'car',
                            )}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Fire Department Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Fire Department Organization
          </Typography>

          {fireByCity.map(({ city, personnel }) => (
            <Card key={city._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {city.name} Fire Department
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {personnel.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No firefighters assigned to this city
                  </Typography>
                ) : (
                  <List>
                    {personnel.map((firefighter) => (
                      <ListItem key={firefighter._id}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          badgeContent={
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                bgcolor: 'error.main',
                              }}
                            >
                              <FireTruck sx={{ fontSize: 12 }} />
                            </Avatar>
                          }
                        >
                          <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                            <Person />
                          </Avatar>
                        </Badge>
                        <ListItemText
                          primary={firefighter.username}
                          secondary={`Badge: ${firefighter.badge || 'N/A'}`}
                        />
                        {firefighter.assignedVehicle && (
                          <Chip
                            icon={<FireTruck />}
                            label={getVehicleName(
                              firefighter.assignedVehicle,
                              'truck',
                            )}
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dispatch Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Dispatch Organization
          </Typography>

          {dispatchByCity.map(({ city, personnel }) => (
            <Card key={city._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {city.name} Dispatch
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {personnel.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No dispatchers assigned to this city
                  </Typography>
                ) : (
                  <List>
                    {personnel.map((dispatcher) => (
                      <ListItem key={dispatcher._id}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          badgeContent={
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                bgcolor: 'warning.main',
                              }}
                            >
                              <Directions sx={{ fontSize: 12 }} />
                            </Avatar>
                          }
                        >
                          <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                            <Person />
                          </Avatar>
                        </Badge>
                        <ListItemText
                          primary={dispatcher.username}
                          secondary={`Badge: ${dispatcher.badge || 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Vehicle Selection Dialog */}
      <Dialog open={vehicleDialogOpen} onClose={handleCloseVehicleDialog}>
        <DialogTitle>
          Select Your {userRole === 'Police' ? 'Police Car' : 'Fire Truck'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="vehicle-select-label">
              {userRole === 'Police' ? 'Car' : 'Truck'}
            </InputLabel>
            <Select
              labelId="vehicle-select-label"
              value={selectedVehicleId}
              label={userRole === 'Police' ? 'Car' : 'Truck'}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {userRole === 'Police'
                ? cars.map((car) => (
                    <MenuItem key={car._id} value={car._id}>
                      {car.name}
                    </MenuItem>
                  ))
                : trucks.map((truck) => (
                    <MenuItem key={truck._id} value={truck._id}>
                      {truck.name}
                    </MenuItem>
                  ))}
            </Select>
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
