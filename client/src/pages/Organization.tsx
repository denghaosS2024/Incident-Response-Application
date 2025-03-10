import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import CityContainer from "../components/Organization/CityContainer";
import request from "../utils/request";

// Interfaces for your data, storing _id from the backend
interface Car {
  assignedCity: string;
  _id: string;
  name: string;
}
interface Truck {
  assignedCity: string;
  _id: string;
  name: string;
}
interface City {
  _id: string;
  name: string;
}
interface Personnel {
  assignedCity: string;
  _id: string;
  name: string;
}

const Organization: React.FC = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState<Car[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [newCar, setNewCar] = useState("");
  const [newTruck, setNewTruck] = useState("");
  const [newCity, setNewCity] = useState("");

  // For reloading city containers after changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      const [carsData, trucksData, citiesData, personnelData] = await Promise.all([
        request<Car[]>("/api/cars"),
        request<Truck[]>("/api/trucks"),
        request<City[]>("/api/cities"),
        request<Personnel[]>("/api/personnel"),
      ]);

      setCars(carsData);
      setTrucks(trucksData);
      setCities(citiesData);
      setPersonnel(personnelData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  // On mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Sorting for display
  const sortedCars = [...cars].sort((a, b) => a.name.localeCompare(b.name));
  const sortedTrucks = [...trucks].sort((a, b) => a.name.localeCompare(b.name));
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  const sortedPersonnel = [...personnel].sort((a, b) => a.name.localeCompare(b.name));

  // Add a new car
  const addCar = async () => {
    if (!newCar.trim()) return;
    try {
      await request("/api/cars", {
        method: "POST",
        body: JSON.stringify({ name: newCar.trim() }),
      });
      setNewCar("");
      await fetchAllData();
    } catch (err) {
      console.error("Error creating car:", err);
    }
  };
  // Remove a car by ID
  const removeCar = async (carId: string) => {
    try {
      await request(`/api/cars/${carId}`, {
        method: "DELETE",
      });
      setCars((prev) => prev.filter((c) => c._id !== carId));
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };
  // Add a new truck
  const addTruck = async () => {
    if (!newTruck.trim()) return;
    try {
      await request("/api/trucks", {
        method: "POST",
        body: JSON.stringify({ name: newTruck.trim() }),
      });
      setNewTruck("");
      await fetchAllData();
    } catch (err) {
      console.error("Error creating truck:", err);
    }
  };
  // Remove a truck
  const removeTruck = async (truckId: string) => {
    try {
      await request(`/api/trucks/${truckId}`, {
        method: "DELETE",
      });
      setTrucks((prev) => prev.filter((t) => t._id !== truckId));
    } catch (err) {
      console.error("Error deleting truck:", err);
    }
  };
  // Add a new city
  const addCity = async () => {
    if (!newCity.trim()) return;
    try {
      await request("/api/cities", {
        method: "POST",
        body: JSON.stringify({ name: newCity.trim() }),
      });
      setNewCity("");
      await fetchAllData();
    } catch (err) {
      console.error("Error creating city:", err);
    }
  };
  // Remove a city
  const removeCity = async (cityId: string) => {
    try {
      await request(`/api/cities/${cityId}`, {
        method: "DELETE",
      });
      setCities((prev) => prev.filter((c) => c._id !== cityId));
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  /**
   * DRAG & DROP LOGIC WITH react-beautiful-dnd
   *
   * We’ll assign droppableId for each list on the left:
   *  - "personnel"
   *  - "cars"
   *  - "trucks"
   *
   * And for each city on the right: "city-<cityName>"
   *
   * For each item we create Draggable with a unique ID like:
   *   "<type>::<name>"
   *
   * Then in onDragEnd, we parse the draggableId and droppableId to see what happened.
   */
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return; // Dropped outside a droppable
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // No movement
    }

    // Draggable ID looks like "Personnel::Jane" or "Car::Car#1"
    const [itemType, itemName] = draggableId.split("::");
    const sourceDroppable = source.droppableId;
    const destDroppable = destination.droppableId;

    // If user drags onto a city droppable
    if (destDroppable.startsWith("city-")) {
      const cityName = destDroppable.replace("city-", "");

      try {
        // Assign item to this city
        await request(`/api/cities/assignments/${cityName}`, {
          method: "PUT",
          body: JSON.stringify({ type: itemType, name: itemName }),
        });
        await fetchAllData();
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error("Error assigning item to city:", err);
      }
    } else {
      // If you need to handle unassigning from a city, or moving items back to a list
      // you can do so here. For example:
      // if (sourceDroppable.startsWith("city-") && destDroppable === "personnel") { ...unassign logic... }
      // Currently this example only shows assignment to a city.
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h6" align="center" style={{ marginBottom: "20px" }}>
        Drag & drop personnel & vehicles:
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" justifyContent="space-between">
          {/* Left side: Personnel, Cars, Trucks */}
          <Card style={{ width: "30%" }}>
            <CardContent>
              {/* Personnel */}
              <Typography variant="h6">Personnel</Typography>
              <Droppable droppableId="personnel">
                {(provided, snapshot) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: "50px" }}
                  >
                    {sortedPersonnel.map((person, index) => {
                      const draggableId = `Personnel::${person.name}`;
                      return (
                        <Draggable
                          key={draggableId}
                          draggableId={draggableId}
                          index={index}
                        >
                          {(providedDrag, snapshotDrag) => (
                            <ListItem
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                            >
                              <ListItemText primary={person.name} />
                            </ListItem>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>

              {/* Cars */}
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
                {(provided, snapshot) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: "50px" }}
                  >
                    {sortedCars.map((car, index) => {
                      const draggableId = `Car::${car.name}`;
                      return (
                        <Draggable
                          key={draggableId}
                          draggableId={draggableId}
                          index={index}
                        >
                          {(providedDrag, snapshotDrag) => (
                            <ListItem
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  onClick={() => removeCar(car._id)}
                                >
                                  <Delete />
                                </IconButton>
                              }
                            >
                              <ListItemText primary={car.name} />
                            </ListItem>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>

              {/* Trucks */}
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
                {(provided, snapshot) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: "50px" }}
                  >
                    {sortedTrucks.map((truck, index) => {
                      const draggableId = `Truck::${truck.name}`;
                      return (
                        <Draggable
                          key={draggableId}
                          draggableId={draggableId}
                          index={index}
                        >
                          {(providedDrag, snapshotDrag) => (
                            <ListItem
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  onClick={() => removeTruck(truck._id)}
                                >
                                  <Delete />
                                </IconButton>
                              }
                            >
                              <ListItemText primary={truck.name} />
                            </ListItem>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Right side: Cities */}
          <Card style={{ width: "60%" }}>
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
                {sortedCities.map((city) => (
                  <Droppable key={city._id} droppableId={`city-${city.name}`}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <ListItemText primary={city.name} />
                          <IconButton
                            edge="end"
                            onClick={() => removeCity(city._id)}
                          >
                            <Delete />
                          </IconButton>
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
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </DragDropContext>
    </div>
  );
};

export default Organization;
