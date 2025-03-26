import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import IIncident from '@/models/Incident'
import getRoleIcon from '@/components/common/RoleIcon'
import AlertSnackbar from '@/components/common/AlertSnackbar'

// import { Add, Delete } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  // IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'

// import CityContainer from '../components/Organization/CityContainer'
import request from '../utils/request'
import { Button } from '@mui/material'
// import { set } from 'lodash'

// Interfaces representing the backend data
interface Car {
  assignedCity: string
  _id: string
  name: string
  usernames: string[]
  assignedIncident: string
}
interface Truck {
  assignedCity: string
  _id: string
  name: string
  usernames: string[]
  assignedIncident: string
}

// interface Incident {
//   incidentId: string
//   openingDate: string
//   type: string
//   priority: string
//   incidentState: string
//   owner: string
//   commander: string
//   assignedVehicles: { type: string; name: string }[]
// }

const ResourcesPage: React.FC = () => {
  // Arrays for each data type
  const [cars, setCars] = useState<Car[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [incidents, setIncidents] = useState<IIncident[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  // For responsive layout
  const isMobile = useMediaQuery('(max-width:600px)')

  // -----------------------------
  //   FETCH DATA FROM BACKEND
  // -----------------------------
  const fetchAllData = async () => {
    try {
      const [carsData, trucksData, incidentData] = await Promise.all([
        request<Car[]>('/api/cars/availability'),
        request<Truck[]>('/api/trucks/availability'),
        // request<City[]>('/api/cities'),
        // request<Personnel[]>('/api/personnel'),
        request<IIncident[]>('/api/incidents'),
      ])

      console.log('incidents', incidentData)
      setCars(carsData)
      setTrucks(trucksData)
      setIncidents(incidentData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Sort for display purpose
  const sortedCars = [...cars].sort((a, b) => a.name.localeCompare(b.name))
  const sortedTrucks = [...trucks].sort((a, b) => a.name.localeCompare(b.name))
  // const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name))
  const sortedIncidents = [...incidents].sort((a, b) =>
    a.incidentId.localeCompare(b.incidentId),
  )

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const renderAssignedVehicles = (incident: IIncident) => {
    if (!incident.assignedVehicles || incident.assignedVehicles.length === 0) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', pl: 1 }}
        >
          No vehicles assigned
        </Typography>
      )
    }

    return incident.assignedVehicles.map((vehicle, index) => {
      // Find the matching vehicle to get usernames

      const usernames: string[] = vehicle.usernames

      return (
        <Draggable
          key={`${vehicle.type}::${vehicle.name}`}
          draggableId={`${vehicle.type}::${vehicle.name}`}
          index={index}
        >
          {(providedDrag) => (
            <Box
              ref={providedDrag.innerRef}
              {...providedDrag.draggableProps}
              {...providedDrag.dragHandleProps}
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                mb: 1,
                p: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {vehicle.name}
                  </Typography>
                  <Box>
                    {getRoleIcon(vehicle.type === 'Car' ? 'Police' : 'Fire')}
                  </Box>
                </Box>

                {usernames.length > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {usernames.join(', ')}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Draggable>
      )
    })
  }
  // -----------------------------
  //     DRAG & DROP LOGIC
  // -----------------------------
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }
    const [itemType, itemName] = draggableId.split('::')
    const destDroppable = destination.droppableId
    const currentUsername: string | null = localStorage.getItem('username')
    if (destDroppable.startsWith('incident-')) {
      const incidentId = destDroppable.replace('incident-', '')
      try {
        const currentIncident: IIncident | undefined = incidents.find(
          (inc) => inc.incidentId === incidentId,
        )
        if (!currentIncident) {
          setErrorMessage('Incident not found')
          setOpenSnackbar(true)
          return
        } else if (currentIncident.commander !== currentUsername) {
          setErrorMessage('You are not the commander of this incident')
          setOpenSnackbar(true)
          return
        }

        const isDuplicate = currentIncident.assignedVehicles.some(
          (v) => v.name === itemName && v.type === itemType,
        )

        if (isDuplicate) {
          setErrorMessage('Vehicle already assigned to this incident')
          setOpenSnackbar(true)
          return
        }

        const matchingVehicle =
          itemType === 'Car'
            ? sortedCars.find((car) => car.name === itemName)
            : sortedTrucks.find((truck) => truck.name === itemName)

        // Prepare the updated incident with the new vehicle
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
        }

        // Update the local state immediately for responsiveness
        setIncidents((prevIncidents) =>
          prevIncidents.map((inc) =>
            inc.incidentId === incidentId ? updatedIncident : inc,
          ),
        )

        if (itemType === 'Car') {
          setCars((prevCars) => prevCars.filter((car) => car.name !== itemName))
        } else if (itemType === 'Truck') {
          setTrucks((prevTrucks) =>
            prevTrucks.filter((truck) => truck.name !== itemName),
          )
        }
      } catch (e: any) {
        if (e.message && e.message.includes('Unexpected end of JSON input')) {
        } else {
          console.error('Error assigning item to incident:', e)
        }
      }
    }
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <Typography variant="h6" align="center" className="mb-4">
        Drag & drop resources:
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box className="row">
          {/* LEFT SIDE: PERSONNEL, CARS, TRUCKS */}
          <div className="col-12 col-md-4 mb-3">
            <Card className="shadow-sm">
              <CardContent>
                <Typography variant="h5" style={{ marginTop: 16 }}>
                  Vehicles
                </Typography>
                {/* CARS */}
                <Typography variant="h6" style={{ marginTop: 16 }}>
                  Cars
                </Typography>
                <Box display="flex" alignItems="center" mb={1}></Box>
                <Droppable droppableId="cars">
                  {(provided) => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: '50px' }}
                    >
                      {sortedCars.map((car, index) => {
                        const draggableId = `Car::${car.name}`
                        const sortedUsernames = [...(car.usernames || [])].sort(
                          (a, b) =>
                            a.localeCompare(b, undefined, {
                              sensitivity: 'base',
                            }),
                        )
                        return (
                          <Draggable
                            key={draggableId}
                            draggableId={draggableId}
                            index={index}
                          >
                            {(providedDrag) => (
                              <ListItem
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                sx={{
                                  touchAction: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  borderRadius: '4px',
                                  mb: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  bgcolor: 'background.paper',
                                  boxShadow: 1,
                                }}
                              >
                                <ListItemText
                                  primary={car.name}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                  }}
                                />
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                  }}
                                >
                                  {sortedUsernames &&
                                  sortedUsernames.length > 0 ? (
                                    sortedUsernames.map((username, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          pl: 1,
                                          py: 0.5,
                                        }}
                                      >
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
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {username}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ pl: 1, py: 0.5 }}
                                    >
                                      No personnel assigned
                                    </Typography>
                                  )}
                                </Box>
                              </ListItem>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>

                {/* TRUCKS */}
                <Typography variant="h6" style={{ marginTop: 16 }}>
                  Trucks
                </Typography>
                <Box display="flex" alignItems="center" mb={1}></Box>
                <Droppable droppableId="trucks">
                  {(provided) => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: '50px' }}
                    >
                      {sortedTrucks.map((truck, index) => {
                        const draggableId = `Truck::${truck.name}`
                        const sortedUsernames = [
                          ...(truck.usernames || []),
                        ].sort((a, b) =>
                          a.localeCompare(b, undefined, {
                            sensitivity: 'base',
                          }),
                        )
                        return (
                          <Draggable
                            key={draggableId}
                            draggableId={draggableId}
                            index={index}
                          >
                            {(providedDrag) => (
                              <ListItem
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                sx={{
                                  touchAction: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  borderRadius: '4px',
                                  mb: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  bgcolor: 'background.paper',
                                  boxShadow: 1,
                                }}
                              >
                                <ListItemText
                                  primary={truck.name}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                  }}
                                />
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                  }}
                                >
                                  {sortedUsernames &&
                                  sortedUsernames.length > 0 ? (
                                    sortedUsernames.map((username, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          pl: 1,
                                          py: 0.5,
                                        }}
                                      >
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
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {username}
                                        </Typography>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ pl: 1, py: 0.5 }}
                                    >
                                      No personnel assigned
                                    </Typography>
                                  )}
                                </Box>
                              </ListItem>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: Incidents */}
          <div className="col-12 col-md-8 mb-3">
            <Card className="shadow-sm">
              <CardContent>
                <List>
                  {sortedIncidents.map((incident) => (
                    <Droppable
                      key={incident.incidentId}
                      droppableId={`incident-${incident.incidentId}`}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="mb-2 border rounded"
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              padding: '8px',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                              className="mb-2"
                            >
                              <ListItemText
                                primary={
                                  <span className="fw-bold">
                                    {incident.incidentId}
                                  </span>
                                }
                              />
                            </Box>
                            {renderAssignedVehicles(incident)}
                          </Box>
                          {provided.placeholder}
                        </ListItem>
                      )}
                    </Droppable>
                  ))}
                </List>
              </CardContent>
            </Card>
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
      {/* SUBMIT & CANCEL BUTTONS */}
      <Typography align="center" className="mb-4" style={{ marginTop: '20px' }}>
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="inherit"
          onClick={() => history.back()}
        >
          Cancel
        </Button>
      </Typography>
    </div>
  )
}

export default ResourcesPage
