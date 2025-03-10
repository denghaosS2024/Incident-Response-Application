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

interface CityAssignment {
  cars: Car[]
  trucks: Truck[]
  personnel: {
    _id: string
    name: string
    assignedCity: string
    role?: 'Fire' | 'Police' | 'Dispatch'
    badge?: string
    assignedVehicle?: string
    assignmentTimestamp?: string
  }[]
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
  const [cityAssignments, setCityAssignments] = useState<
    Map<string, CityAssignment>
  >(new Map())
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
    const userId = localStorage.getItem('userId')

    console.log('Current user role from localStorage:', role)
    console.log('Current user ID from localStorage:', userId)

    setUserRole(role)
    setUserId(userId)

    // Load all organization data - first fetch cities, then fetch assignments for each city
    fetchCities()
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

  // Fetch all cities first
  const fetchCities = async () => {
    try {
      const citiesResponse = await fetch('/api/cities')
      if (citiesResponse.ok) {
        const citiesData: City[] = await citiesResponse.json()
        console.log('Cities fetched:', citiesData)
        setCities(citiesData)

        if (citiesData.length > 0) {
          // Fetch assignments for each city sequentially to avoid race conditions
          for (const city of citiesData) {
            console.log(`Fetching assignments for city: ${city.name}`)
            await fetchCityAssignments(city)
          }

          console.log('All city assignments fetched')
        } else {
          console.log('No cities available to fetch assignments')
        }
      } else {
        console.error('Failed to fetch cities:', citiesResponse.statusText)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  // Fetch assignments for a specific city
  const fetchCityAssignments = async (city: City) => {
    try {
      console.log(
        `Starting fetchCityAssignments for ${city.name} (ID: ${city._id})`,
      )
      const encodedCityName = encodeURIComponent(city.name)
      const requestUrl = `/api/cities/assignments/${encodedCityName}`
      console.log(`Fetching from URL: ${requestUrl}`)

      const response = await fetch(requestUrl)
      console.log(`Response status for ${city.name}: ${response.status}`)

      if (response.ok) {
        // Parse the response
        const rawData = await response.text()
        console.log(`Raw data received for ${city.name}:`, rawData)

        let assignmentData: CityAssignment
        try {
          assignmentData = JSON.parse(rawData)
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${city.name}:`, parseError)
          return null
        }

        console.log(`Parsed data for ${city.name}:`, assignmentData)

        // Validate the response structure
        if (
          !assignmentData.personnel ||
          !Array.isArray(assignmentData.personnel)
        ) {
          console.error(
            `Invalid personnel data for ${city.name}, using empty array`,
          )
          assignmentData.personnel = []
        }

        if (!assignmentData.cars || !Array.isArray(assignmentData.cars)) {
          console.error(`Invalid cars data for ${city.name}, using empty array`)
          assignmentData.cars = []
        }

        if (!assignmentData.trucks || !Array.isArray(assignmentData.trucks)) {
          console.error(
            `Invalid trucks data for ${city.name}, using empty array`,
          )
          assignmentData.trucks = []
        }

        // Ensure each personnel has the required fields and proper roles
        assignmentData.personnel = assignmentData.personnel.map((person) => {
          // Handle missing name field
          if (!person.name && person._id) {
            console.warn(
              `Person with ID ${person._id} has no name, using ID as name`,
            )
            person.name = `User ${person._id}`
          }

          // Make sure assignedCity is set
          person.assignedCity = person.assignedCity || city._id

          // If role is missing, try to infer it
          const role =
            person.role ||
            (assignmentData.cars.some(
              (car) => car._id === person.assignedVehicle,
            )
              ? 'Police'
              : assignmentData.trucks.some(
                    (truck) => truck._id === person.assignedVehicle,
                  )
                ? 'Fire'
                : 'Dispatch')

          return {
            ...person,
            role,
          }
        })

        console.log(
          `Processed assignment data for ${city.name}:`,
          assignmentData,
        )

        // Update the city assignments map
        setCityAssignments((prev) => {
          const newMap = new Map(prev)
          newMap.set(city._id, assignmentData)
          console.log(
            `Added assignment for ${city.name} to map, new size: ${newMap.size}`,
          )
          return newMap
        })

        return assignmentData
      } else {
        console.error(
          `API call failed for city ${city.name}: ${response.status} ${response.statusText}`,
        )
      }
    } catch (error) {
      console.error(`Error fetching assignments for city ${city.name}:`, error)
    }

    // If we reach here, something went wrong. Return a default assignment object
    const emptyAssignment: CityAssignment = {
      cars: [],
      trucks: [],
      personnel: [],
    }

    // Still update the map with empty data to avoid repeated failed requests
    setCityAssignments((prev) => {
      const newMap = new Map(prev)
      newMap.set(city._id, emptyAssignment)
      return newMap
    })

    return emptyAssignment
  }

  // Update aggregated data whenever cityAssignments changes
  useEffect(() => {
    if (cityAssignments.size > 0) {
      console.log('City assignments updated, count:', cityAssignments.size)
      // Convert Map entries to array before logging
      const assignmentsArray = Array.from(cityAssignments.entries())
      console.log('City assignments data:', assignmentsArray)

      // Aggregate personnel data from all city assignments for current user lookup
      const allPersonnel: Personnel[] = []

      // Use Array.from to convert Map to array before iterating
      Array.from(cityAssignments.entries()).forEach(([cityId, assignment]) => {
        console.log(
          `Processing city ${cityId} with ${assignment.personnel.length} personnel`,
        )
        assignment.personnel.forEach((person) => {
          allPersonnel.push({
            _id: person._id,
            username: person.name,
            role: person.role || 'Dispatch',
            assignedCity: person.assignedCity,
            assignedVehicle: person.assignedVehicle,
            badge: person.badge,
            assignmentTimestamp: person.assignmentTimestamp,
          })
        })
      })

      console.log('All personnel aggregated:', allPersonnel)
      setPersonnel(allPersonnel)

      // Aggregate all cars and trucks
      const allCars: Car[] = []
      const allTrucks: Truck[] = []

      Array.from(cityAssignments.entries()).forEach(([cityId, assignment]) => {
        console.log(
          `Processing city ${cityId} with ${assignment.cars.length} cars and ${assignment.trucks.length} trucks`,
        )
        allCars.push(...assignment.cars)
        allTrucks.push(...assignment.trucks)
      })

      setCars(allCars)
    }
  }, [cityAssignments])

  // Update city assignments after a vehicle assignment
  const refreshCityAssignment = async (cityId: string) => {
    const city = cities.find((c) => c._id === cityId)
    if (city) {
      await fetchCityAssignments(city)
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

  // Submit vehicle selection from the dialog
  const handleSelectVehicle = async () => {
    if (!selectedVehicleId || !userId || !selectedCity) return

    try {
      // Determine if we're assigning a car or a truck based on user role - case-insensitive
      const isPoliceRole = userRole && userRole.toLowerCase() === 'police'
      const vehicleType = isPoliceRole ? 'car' : 'truck'

      // RESTful API endpoint for assigning vehicles to personnel - same as in handleDirectVehicleSelection
      const response = await fetch(`/api/personnel/${userId}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          vehicleType,
          cityId: selectedCity._id,
        }),
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

        // Close the dialog if it's open
        handleCloseVehicleDialog()

        // Refresh only the affected city assignment
        await refreshCityAssignment(selectedCity._id)
      } else {
        console.error('Failed to assign vehicle:', response.statusText)
        // TODO: Add error handling UI feedback
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error)
      // TODO: Add error handling UI feedback
    }
  }

  // Handle direct vehicle selection from the radio buttons
  const handleDirectVehicleSelection = async (
    vehicleId: string,
    city: City,
  ) => {
    // Set the selected vehicle and city
    setSelectedVehicleId(vehicleId)
    setSelectedCity(city)

    // Then trigger the vehicle assignment process
    if (userId && vehicleId && city) {
      try {
        // Determine if we're assigning a car or a truck based on user role - case-insensitive
        const isPoliceRole = userRole && userRole.toLowerCase() === 'police'
        const vehicleType = isPoliceRole ? 'car' : 'truck'

        // RESTful API endpoint for assigning vehicles to personnel
        const response = await fetch(`/api/personnel/${userId}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: vehicleId,
            vehicleType,
            cityId: city._id,
          }),
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
                    assignedVehicle: vehicleId,
                    assignmentTimestamp: timestamp,
                  }
                : person,
            ),
          )

          // Refresh only the affected city assignment
          await refreshCityAssignment(city._id)
        } else {
          console.error(
            'Failed to directly assign vehicle:',
            response.statusText,
          )
        }
      } catch (error) {
        console.error('Error directly assigning vehicle:', error)
      }
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
    userId &&
    userRole &&
    (userRole.toLowerCase() === 'police' || userRole.toLowerCase() === 'fire')

  // Group personnel by city for easier rendering - use the cityAssignments data
  const getCityPersonnel = (
    cityId: string,
    role: 'Fire' | 'Police' | 'Dispatch',
  ) => {
    const assignment = cityAssignments.get(cityId)
    if (!assignment) {
      console.log(`No assignment found for city ${cityId}`)
      return []
    }

    // Log the personnel in this city
    console.log(
      `Personnel in city ${cityId} with role ${role}:`,
      assignment.personnel.filter((p) => p.role === role),
    )

    return assignment.personnel
      .filter((p) => p.role === role)
      .map((p) => ({
        _id: p._id,
        username: p.name,
        role: p.role,
        assignedCity: p.assignedCity,
        assignedVehicle: p.assignedVehicle,
        badge: p.badge,
        assignmentTimestamp: p.assignmentTimestamp,
      }))
  }

  // Get cars for a specific city
  const getCityCars = (cityId: string) => {
    const assignment = cityAssignments.get(cityId)
    return assignment ? assignment.cars : []
  }

  // Get trucks for a specific city
  const getCityTrucks = (cityId: string) => {
    const assignment = cityAssignments.get(cityId)
    return assignment ? assignment.trucks : []
  }

  // Group personnel by city for easier rendering
  const personnelByCity = cities.map((city) => ({
    city,
    police: getCityPersonnel(city._id, 'Police'),
    fire: getCityPersonnel(city._id, 'Fire'),
    dispatch: getCityPersonnel(city._id, 'Dispatch'),
  }))

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Organization Chart
      </Typography>

      {/* Debug info - only visible during development */}
      {process.env.NODE_ENV === 'development' && (
        <Card sx={{ mb: 2, bgcolor: '#f8f9fa', p: 2 }}>
          <Typography variant="subtitle2">Debug Info:</Typography>
          <Typography variant="body2">Cities: {cities.length}</Typography>
          <Typography variant="body2">
            CityAssignments: {cityAssignments.size}
          </Typography>
          <Typography variant="body2">
            Total personnel: {personnel.length}
          </Typography>
          <Typography variant="body2">Total cars: {cars.length}</Typography>
          <Typography variant="body2">Total trucks: {trucks.length}</Typography>
          <Typography variant="body2">
            UserRole: {userRole || 'None'} (Can select vehicle:{' '}
            {canSelectVehicle ? 'Yes' : 'No'})
          </Typography>
          <Typography variant="body2">
            CurrentUser: {currentUser ? currentUser.username : 'None'}
          </Typography>
          {personnel.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Personnel Roles:</Typography>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                {personnel.map((person) => (
                  <li key={person._id}>
                    {person.username}: {person.role}
                    {person._id === userId && ' (current user)'}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Card>
      )}

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
      {cities.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          Loading cities data...
        </Typography>
      )}

      {cities.length > 0 && cityAssignments.size === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          Loading city assignments...
        </Typography>
      )}

      {/* Render each city with its assignments */}
      {cities.map((city) => {
        // Get data for this city
        const cityAssignment = cityAssignments.get(city._id)
        const police = getCityPersonnel(city._id, 'Police')
        const fire = getCityPersonnel(city._id, 'Fire')
        const dispatch = getCityPersonnel(city._id, 'Dispatch')
        const cityCars = getCityCars(city._id)
        const cityTrucks = getCityTrucks(city._id)

        return (
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
                {/* Show count of personnel */}
                <Typography variant="caption" sx={{ ml: 2 }}>
                  ({police.length + fire.length + dispatch.length} personnel)
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {/* Add a loading state if assignment data isn't loaded yet */}
              {!cityAssignment && (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                  Loading assignments for {city.name}...
                </Typography>
              )}

              {cityAssignment && (
                <Grid container spacing={2}>
                  {/* Fire Department */}
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
                        {/* Section 1: Personnel List */}
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Personnel
                        </Typography>
                        {fire.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 1 }}
                          >
                            No firefighters assigned to this location
                          </Typography>
                        ) : (
                          <List
                            sx={{ mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}
                          >
                            {fire.map((firefighter) => (
                              <ListItem
                                key={firefighter._id}
                                sx={{ borderBottom: '1px solid #eee', py: 1 }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'error.main' }}>
                                    <FireExtinguisher />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 'medium' }}>
                                        {firefighter.username}
                                      </Typography>
                                      {firefighter.assignedVehicle &&
                                        firefighter.assignmentTimestamp && (
                                          <Typography
                                            component="span"
                                            sx={{
                                              ml: 1,
                                              color: 'text.secondary',
                                            }}
                                          >
                                            (
                                            {getVehicleName(
                                              firefighter.assignedVehicle,
                                              'truck',
                                            )}{' '}
                                            – {firefighter.assignmentTimestamp})
                                          </Typography>
                                        )}
                                    </Box>
                                  }
                                  secondary={
                                    firefighter.badge
                                      ? `Badge: ${firefighter.badge}`
                                      : undefined
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}

                        {/* Section 2: Trucks List */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                          Trucks
                        </Typography>
                        {cityTrucks.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 1 }}
                          >
                            No trucks available at this location
                          </Typography>
                        ) : (
                          <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            {cityTrucks.map((truck) => (
                              <ListItem
                                key={truck._id}
                                sx={{
                                  borderBottom: '1px solid #eee',
                                  py: 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <FireExtinguisher
                                    color="error"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography>{truck.name}</Typography>
                                </Box>

                                {/* Only show radio buttons if current user is a Firefighter */}
                                {userRole &&
                                  (userRole.toLowerCase() === 'fire' ||
                                    userRole.toLowerCase() ===
                                      'firefighter') && (
                                    <Box>
                                      <Radio
                                        checked={
                                          currentUser?.assignedVehicle ===
                                          truck._id
                                        }
                                        onChange={() =>
                                          handleDirectVehicleSelection(
                                            truck._id,
                                            city,
                                          )
                                        }
                                      />
                                    </Box>
                                  )}
                              </ListItem>
                            ))}
                          </List>
                        )}

                        {/* Vehicle Assignment button for current user if they are firefighter */}
                        {userId &&
                          userRole &&
                          (userRole.toLowerCase() === 'fire' ||
                            userRole.toLowerCase() === 'firefighter') && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleOpenVehicleDialog(city)}
                              sx={{ mt: 2 }}
                              fullWidth
                            >
                              Assign Truck
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Police Department */}
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
                        {/* Section 1: Personnel List */}
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Personnel
                        </Typography>
                        {police.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 1 }}
                          >
                            No police officers assigned to this location
                          </Typography>
                        ) : (
                          <List
                            sx={{ mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}
                          >
                            {police.map((officer) => (
                              <ListItem
                                key={officer._id}
                                sx={{ borderBottom: '1px solid #eee', py: 1 }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <LocalPolice />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Typography sx={{ fontWeight: 'medium' }}>
                                        {officer.username}
                                      </Typography>
                                      {officer.assignedVehicle &&
                                        officer.assignmentTimestamp && (
                                          <Typography
                                            component="span"
                                            sx={{
                                              ml: 1,
                                              color: 'text.secondary',
                                            }}
                                          >
                                            (
                                            {getVehicleName(
                                              officer.assignedVehicle,
                                              'car',
                                            )}{' '}
                                            – {officer.assignmentTimestamp})
                                          </Typography>
                                        )}
                                    </Box>
                                  }
                                  secondary={
                                    officer.badge
                                      ? `Badge: ${officer.badge}`
                                      : undefined
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}

                        {/* Section 2: Cars List */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                          Cars
                        </Typography>
                        {cityCars.length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 1 }}
                          >
                            No cars available at this location
                          </Typography>
                        ) : (
                          <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            {cityCars.map((car) => (
                              <ListItem
                                key={car._id}
                                sx={{
                                  borderBottom: '1px solid #eee',
                                  py: 1,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <DirectionsCar
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography>{car.name}</Typography>
                                </Box>

                                {/* Only show radio buttons if current user is a Police Officer */}
                                {userRole &&
                                  userRole.toLowerCase() === 'police' && (
                                    <Box>
                                      <Radio
                                        checked={
                                          currentUser?.assignedVehicle ===
                                          car._id
                                        }
                                        onChange={() =>
                                          handleDirectVehicleSelection(
                                            car._id,
                                            city,
                                          )
                                        }
                                      />
                                    </Box>
                                  )}
                              </ListItem>
                            ))}
                          </List>
                        )}

                        {/* Vehicle Assignment button for current user if they are police */}
                        {userId &&
                          userRole &&
                          userRole.toLowerCase() === 'police' && (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => handleOpenVehicleDialog(city)}
                              sx={{ mt: 2 }}
                              fullWidth
                            >
                              Assign Car
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Dispatch Section */}
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
                          <List sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            {dispatch.map((dispatcher) => (
                              <ListItem
                                key={dispatcher._id}
                                sx={{ borderBottom: '1px solid #eee', py: 1 }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                                    <Directions />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography sx={{ fontWeight: 'medium' }}>
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 2, fontStyle: 'italic' }}
                          >
                            Dispatchers cannot be assigned to vehicles
                          </Typography>
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
              )}
            </AccordionDetails>
          </Accordion>
        )
      })}

      {/* Vehicle Assignment Dialog with Radio Buttons */}
      <Dialog
        open={vehicleDialogOpen}
        onClose={handleCloseVehicleDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {userRole && userRole.toLowerCase() === 'police'
            ? `Select Your Police Car in ${selectedCity?.name || ''}`
            : `Select Your Fire Truck in ${selectedCity?.name || ''}`}
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
            <RadioGroup
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              {userRole && userRole.toLowerCase() === 'police'
                ? getCityCars(selectedCity?._id || '').map((car) => (
                    <FormControlLabel
                      key={car._id}
                      value={car._id}
                      control={<Radio />}
                      label={car.name}
                    />
                  ))
                : getCityTrucks(selectedCity?._id || '').map((truck) => (
                    <FormControlLabel
                      key={truck._id}
                      value={truck._id}
                      control={<Radio />}
                      label={truck.name}
                    />
                  ))}
              {((userRole &&
                userRole.toLowerCase() === 'police' &&
                getCityCars(selectedCity?._id || '').length === 0) ||
                (userRole &&
                  userRole.toLowerCase() === 'fire' &&
                  getCityTrucks(selectedCity?._id || '').length === 0)) && (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No vehicles available for this location
                </Typography>
              )}
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
