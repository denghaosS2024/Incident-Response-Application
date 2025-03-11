import { Add, Delete } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import { useNavigate } from 'react-router-dom'
import CityContainer from '../components/Organization/CityContainer'
import request from '../utils/request'

// Interfaces for your data, storing _id from the backend
interface Car {
  assignedCity: string
  _id: string
  name: string
}
interface Truck {
  assignedCity: string
  _id: string
  name: string
}
interface City {
  _id: string
  name: string
}
interface Personnel {
  assignedCity: string
  _id: string
  name: string
}

const Organization: React.FC = () => {
  const navigate = useNavigate()

  const [cars, setCars] = useState<Car[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [newCar, setNewCar] = useState('')
  const [newTruck, setNewTruck] = useState('')
  const [newCity, setNewCity] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // For responsive spacing/text
  const isMobile = useMediaQuery('(max-width:600px)')

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      const [carsData, trucksData, citiesData, personnelData] =
        await Promise.all([
          request<Car[]>('/api/cars'),
          request<Truck[]>('/api/trucks'),
          request<City[]>('/api/cities'),
          request<Personnel[]>('/api/personnel'),
        ])
      setCars(carsData)
      setTrucks(trucksData)
      setCities(citiesData)
      setPersonnel(personnelData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  // On mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Sorting for display
  const sortedCars = [...cars].sort((a, b) => a.name.localeCompare(b.name))
  const sortedTrucks = [...trucks].sort((a, b) => a.name.localeCompare(b.name))
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name))
  const sortedPersonnel = [...personnel].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  // -------------------
  //     ADD/REMOVE
  // -------------------
  const addCar = async () => {
    if (!newCar.trim()) return
    try {
      await request('/api/cars', {
        method: 'POST',
        body: JSON.stringify({ name: newCar.trim() }),
      })
      setNewCar('')
      await fetchAllData()
    } catch (err) {
      console.error('Error creating car:', err)
    }
  }

  const removeCar = async (carId: string) => {
    try {
      await request(`/api/cars/${carId}`, { method: 'DELETE' })
      setCars((prev) => prev.filter((c) => c._id !== carId))
    } catch (err) {
      console.error('Error deleting car:', err)
    }
  }

  const addTruck = async () => {
    if (!newTruck.trim()) return
    try {
      await request('/api/trucks', {
        method: 'POST',
        body: JSON.stringify({ name: newTruck.trim() }),
      })
      setNewTruck('')
      await fetchAllData()
    } catch (err) {
      console.error('Error creating truck:', err)
    }
  }

  const removeTruck = async (truckId: string) => {
    try {
      await request(`/api/trucks/${truckId}`, { method: 'DELETE' })
      setTrucks((prev) => prev.filter((t) => t._id !== truckId))
    } catch (err) {
      console.error('Error deleting truck:', err)
    }
  }

  const addCity = async () => {
    if (!newCity.trim()) return
    try {
      await request('/api/cities', {
        method: 'POST',
        body: JSON.stringify({ name: newCity.trim() }),
      })
      setNewCity('')
      await fetchAllData()
    } catch (err) {
      console.error('Error creating city:', err)
    }
  }

  // Remove city only if empty
  // const removeCity = async (cityId: string) => {
  //   const city = cities.find((c) => c._id === cityId)
  //   if (!city) return

  //   // Check if city has assigned items by city._id
  //   const hasPersonnel = personnel.some((p) => p.assignedCity === city._id)
  //   const hasCars = cars.some((c) => c.assignedCity === city._id)
  //   const hasTrucks = trucks.some((t) => t.assignedCity === city._id)

  //   if (hasPersonnel || hasCars || hasTrucks) {
  //     console.error(
  //       `Cannot delete city "${city.name}" because it is not empty.`,
  //     )
  //     return
  //   }

  //   try {
  //     await request(`/api/cities/${cityId}`, { method: 'DELETE' })
  //     setCities((prev) => prev.filter((c) => c._id !== cityId))
  //   } catch (err) {
  //     console.error('Error deleting city:', err)
  //   }
  // }

  // -------------------
  //   DRAG & DROP
  // -------------------
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

    if (destDroppable.startsWith('city-')) {
      const cityName = destDroppable.replace('city-', '')
      try {
        await request(`/api/cities/assignments/${cityName}`, {
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
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'hidden' }}>
      <Typography variant="h6" align="center" style={{ marginBottom: '20px' }}>
        Drag & drop personnel & vehicles:
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" justifyContent="space-between">
          {/* LEFT: PERSONNEL, CARS, TRUCKS */}
          <Card style={{ width: isMobile ? '45%' : '30%' }}>
            <CardContent>
              {/* PERSONNEL */}
              <Typography variant="h6">Personnel</Typography>
              <Droppable droppableId="personnel">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: '50px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {sortedPersonnel.map((person, index) => {
                      const draggableId = `Personnel::${person.name}`
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
                              sx={{ touchAction: 'none' }}
                            >
                              <ListItemText primary={person.name} />
                            </ListItem>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>

              {/* CARS */}
              <Typography variant="h6" style={{ marginTop: 16 }}>
                Cars
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  value={newCar}
                  onChange={(e) => setNewCar(e.target.value)}
                  placeholder="New Car"
                />
                <IconButton onClick={addCar}>
                  <Add />
                </IconButton>
              </Box>
              <Droppable droppableId="cars">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: '50px' }}
                  >
                    {sortedCars.map((car, index) => {
                      const draggableId = `Car::${car.name}`
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
                                padding: isMobile ? '4px 8px' : '6px 12px',
                              }}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => removeCar(car._id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={car.name}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                                }}
                              />
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
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  value={newTruck}
                  onChange={(e) => setNewTruck(e.target.value)}
                  placeholder="New Truck"
                />
                <IconButton onClick={addTruck}>
                  <Add />
                </IconButton>
              </Box>
              <Droppable droppableId="trucks">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: '50px' }}
                  >
                    {sortedTrucks.map((truck, index) => {
                      const draggableId = `Truck::${truck.name}`
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
                                padding: isMobile ? '4px 8px' : '6px 12px',
                              }}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => removeTruck(truck._id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={truck.name}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                                }}
                              />
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

          {/* RIGHT: CITIES */}
          <Card style={{ width: isMobile ? '50%' : '60%' }}>
            <CardContent>
              <Typography variant="h6">Cities</Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="New City"
                />
                <IconButton onClick={addCity}>
                  <Add />
                </IconButton>
              </Box>

              <List>
                {sortedCities.map((city) => {
                  // Check if city is empty by comparing assignedCity to city._id
                  const hasPersonnel = personnel.some(
                    (p) => p.assignedCity === city._id,
                  )
                  const hasCars = cars.some((c) => c.assignedCity === city._id)
                  const hasTrucks = trucks.some(
                    (t) => t.assignedCity === city._id,
                  )
                  const isEmpty = !hasPersonnel && !hasCars && !hasTrucks

                  return (
                    <Droppable key={city._id} droppableId={`city-${city.name}`}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            border: '1px solid #ccc',
                            marginBottom: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              width: '100%',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <ListItemText primary={city.name} />
                            {/* {isEmpty && (
                              <IconButton
                                edge="end"
                                onClick={() => removeCity(city._id)}
                              >
                                <Delete />
                              </IconButton>
                            )} */}
                          </Box>

                          {/* CityContainer for assigned vehicles & personnel */}
                          <Box>
                            <CityContainer
                              cityName={city.name}
                              refreshTrigger={refreshTrigger}
                            />
                          </Box>

                          {provided.placeholder}
                        </ListItem>
                      )}
                    </Droppable>
                  )
                })}
              </List>
            </CardContent>
          </Card>
        </Box>
      </DragDropContext>
    </div>
  )
}

export default Organization
