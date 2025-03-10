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

  // We'll store arrays of objects with _id and name
  const [cars, setCars] = useState<Car[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  // Input states for new items
  const [newCar, setNewCar] = useState("");
  const [newTruck, setNewTruck] = useState("");
  const [newCity, setNewCity] = useState("");

  // This is our "force reload" for every CityContainer
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // A helper to (re)fetch all data from the backend, used after changes
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

  // On mount, load all from backend
  useEffect(() => {
    fetchAllData();
  }, []);

  // Sort them by name for display
  const sortedCars = [...cars].sort((a, b) => a.name.localeCompare(b.name));
  const sortedTrucks = [...trucks].sort((a, b) => a.name.localeCompare(b.name));
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  const sortedPersonnel = [...personnel].sort((a, b) => a.name.localeCompare(b.name));

  // Add a new car
  const addCar = async () => {
    if (!newCar.trim()) return;
    try {
      // POST new car
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
      setCars(cars.filter((c) => c._id !== carId));
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };

  // Add a new truck
  const addTruck = async () => {
    if (!newTruck.trim()) return;
    try {
      // POST new truck
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

  // Remove a truck by ID
  const removeTruck = async (truckId: string) => {
    try {
      await request(`/api/trucks/${truckId}`, {
        method: "DELETE",
      });
      setTrucks(trucks.filter((t) => t._id !== truckId));
    } catch (err) {
      console.error("Error deleting truck:", err);
    }
  };

  // Add a new city
  const addCity = async () => {
    if (!newCity.trim()) return;
    try {
      // POST new city
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

  // Remove a city by ID
  const removeCity = async (cityId: string) => {
    try {
      await request(`/api/cities/${cityId}`, {
        method: "DELETE",
      });
      setCities(cities.filter((c) => c._id !== cityId));
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  // -----------------------
  // DRAG & DROP LOGIC
  // -----------------------
  const handleDragStart = (
    e: React.DragEvent<HTMLElement>,
    itemType: "Car" | "Truck" | "Personnel",
    itemName: string
  ) => {
    e.dataTransfer.setData("type", itemType);
    e.dataTransfer.setData("name", itemName);
  };

  const handleDropOnCity = async (
    e: React.DragEvent<HTMLElement>,
    cityName: string
  ) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData("type");
    const itemName = e.dataTransfer.getData("name");

    if (!itemType || !itemName) return;

    try {
      // PUT assignment
      await request(`/api/cities/assignments/${cityName}`, {
        method: "PUT",
        body: JSON.stringify({ type: itemType, name: itemName }),
      });
      // Re-fetch parent data for the left lists
      await fetchAllData();
      // Also tell all CityContainers to refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error assigning item to city:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* <Button variant="contained" onClick={() => navigate(-1)}>Back</Button> */}

      <Typography variant="h6" align="center" style={{ marginBottom: "20px" }}>
        Drag & drop personnel & vehicles:
      </Typography>

      <Box display="flex" justifyContent="space-between">
        {/* Left Side: Personnel, Cars, Trucks */}
        <Card style={{ width: "30%" }}>
          <CardContent>
            {/* Personnel */}
            <Typography variant="h6">Personnel</Typography>
            <List>
              {sortedPersonnel.map((person) => (
                <ListItem
                  key={person._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "Personnel", person.name)}
                >
                  <ListItemText primary={person.name} />
                </ListItem>
              ))}
            </List>

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
            <List>
              {sortedCars.map((car) => (
                <ListItem
                  key={car._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "Car", car.name)}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeCar(car._id)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={car.name} />
                </ListItem>
              ))}
            </List>

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
            <List>
              {sortedTrucks.map((truck) => (
                <ListItem
                  key={truck._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "Truck", truck.name)}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeTruck(truck._id)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={truck.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Right Side: Cities */}
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
                <ListItem
                  key={city._id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnCity(e, city.name)}
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

                  {/* CityContainer for vehicles & personnel */}
                  <Box>
                    <CityContainer cityName={city.name} refreshTrigger={refreshTrigger} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Organization;
