import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import IIncident from '@/models/Incident'
import getRoleIcon from '@/components/common/RoleIcon'

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
  assignedIncidents: IIncident[]
}
interface Truck {
  assignedCity: string
  _id: string
  name: string
  usernames: string[]
  assignedIncidents: IIncident[]
}

interface Incident {
  incidentId: string
  openingDate: string
  type: string
  priority: string
  incidentState: string
  owner: string
  commander: string
}

const ResourcesPage: React.FC = () => {
  // Arrays for each data type
  const [cars, setCars] = useState<Car[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  // Used to refresh CityContainer after changes
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
        request<Incident[]>('/api/incidents'),
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

    if (destDroppable.startsWith('incident-')) {
      // TODO: Change the api from City to Incident for allocation
      const incidentName = destDroppable.replace('incident-', '')
      try {
        await request(`/api/cities/assignments/${incidentName}`, {
          method: 'PUT',
          body: JSON.stringify({ type: itemType, name: itemName }),
        })
        await fetchAllData()
        setRefreshTrigger((prev) => prev + 1)
      } catch (err) {
        console.error('Error assigning item to city:', err)
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
                            {/* City name + delete button */}
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

                            {/* CityContainer displays assigned cars/trucks/personnel */}
                            {/* <Box>
                              <CityContainer
                                cityName={incident.incidentId}
                                refreshTrigger={refreshTrigger}
                              />
                            </Box> */}
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
