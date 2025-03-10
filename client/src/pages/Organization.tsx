import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  useMediaQuery,
  Theme
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Interfaces for your data, storing _id from the backend
interface Car {
  _id: string;
  name: string;
}
interface Truck {
  _id: string;
  name: string;
}
interface City {
  _id: string;
  name: string;
}
interface Personnel {
    _id: string;
    name: string;
    role: "Firefighter" | "Police Officer"; 
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

  // On mount, load all from backend
  useEffect(() => {
    // Load cars
    fetch("/api/cars")
      .then(res => res.json())
      .then((data: Car[]) => setCars(data))
      .catch(err => console.error("Failed to fetch cars:", err));

    // Load trucks
    fetch("/api/trucks")
      .then(res => res.json())
      .then((data: Truck[]) => setTrucks(data))
      .catch(err => console.error("Failed to fetch trucks:", err));

    // Load cities
    fetch("/api/cities")
      .then(res => res.json())
      .then((data: City[]) => setCities(data))
      .catch(err => console.error("Failed to fetch cities:", err));

      fetch("/api/personnel")
      .then(res => res.json())
      .then((data: Personnel[]) => setPersonnel(data))
      .catch(err => console.error("Failed to fetch personnel:", err));
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
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCar.trim() })
      });
      if (response.ok) {
        const createdCar: Car = await response.json();
        setCars([...cars, createdCar]);
        setNewCar("");
      } else {
        console.error("Failed to create car:", response.statusText);
      }
    } catch (err) {
      console.error("Error creating car:", err);
    }
  };

  // Remove a car by ID
  const removeCar = async (carId: string) => {
    try {
      const response = await fetch(`/api/cars/${carId}`, { method: "DELETE" });
      if (response.ok) {
        setCars(cars.filter((c) => c._id !== carId));
      } else {
        console.error("Failed to delete car:", response.statusText);
      }
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };

  // Add a new truck
  const addTruck = async () => {
    if (!newTruck.trim()) return;
    try {
      const response = await fetch("/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTruck.trim() })
      });
      if (response.ok) {
        const createdTruck: Truck = await response.json();
        setTrucks([...trucks, createdTruck]);
        setNewTruck("");
      } else {
        console.error("Failed to create truck:", response.statusText);
      }
    } catch (err) {
      console.error("Error creating truck:", err);
    }
  };

  // Remove a truck by ID
  const removeTruck = async (truckId: string) => {
    try {
      const response = await fetch(`/api/trucks/${truckId}`, { method: "DELETE" });
      if (response.ok) {
        setTrucks(trucks.filter((t) => t._id !== truckId));
      } else {
        console.error("Failed to delete truck:", response.statusText);
      }
    } catch (err) {
      console.error("Error deleting truck:", err);
    }
  };

  // Add a new city
  const addCity = async () => {
    if (!newCity.trim()) return;
    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCity.trim() })
      });
      if (response.ok) {
        const createdCity: City = await response.json();
        setCities([...cities, createdCity]);
        setNewCity("");
      } else {
        console.error("Failed to create city:", response.statusText);
      }
    } catch (err) {
      console.error("Error creating city:", err);
    }
  };

  // Remove a city by ID
  const removeCity = async (cityId: string) => {
    try {
      const response = await fetch(`/api/cities/${cityId}`, { method: "DELETE" });
      if (response.ok) {
        setCities(cities.filter((c) => c._id !== cityId));
      } else {
        console.error("Failed to delete city:", response.statusText);
      }
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>

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
                <ListItem key={person._id}>
                  <ListItemText primary={person.name} secondary={person.role} />
                </ListItem>
              ))}
            </List>

            {/* Cars */}
            <Typography variant="h6" style={{ marginTop: 16 }}>Cars</Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <TextField
                size="small"
                value={newCar}
                onChange={(e) => setNewCar(e.target.value)}
                placeholder="New Car"
              />
              <IconButton onClick={async () => {
                if (!newCar.trim()) return;
                const response = await fetch("/api/cars", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newCar.trim() })
                });
                if (response.ok) {
                  const createdCar: Car = await response.json();
                  setCars([...cars, createdCar]);
                  setNewCar("");
                }
              }}>
                <Add />
              </IconButton>
            </Box>
            <List>
              {sortedCars.map((car) => (
                <ListItem key={car._id} secondaryAction={
                  <IconButton edge="end" onClick={async () => {
                    const response = await fetch(`/api/cars/${car._id}`, { method: "DELETE" });
                    if (response.ok) {
                      setCars(cars.filter((c) => c._id !== car._id));
                    }
                  }}>
                    <Delete />
                  </IconButton>
                }>
                  <ListItemText primary={car.name} />
                </ListItem>
              ))}
            </List>

            {/* Trucks */}
            <Typography variant="h6" style={{ marginTop: 16 }}>Trucks</Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <TextField
                size="small"
                value={newTruck}
                onChange={(e) => setNewTruck(e.target.value)}
                placeholder="New Truck"
              />
              <IconButton onClick={async () => {
                if (!newTruck.trim()) return;
                const response = await fetch("/api/trucks", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newTruck.trim() })
                });
                if (response.ok) {
                  const createdTruck: Truck = await response.json();
                  setTrucks([...trucks, createdTruck]);
                  setNewTruck("");
                }
              }}>
                <Add />
              </IconButton>
            </Box>
            <List>
              {sortedTrucks.map((truck) => (
                <ListItem key={truck._id} secondaryAction={
                  <IconButton edge="end" onClick={async () => {
                    const response = await fetch(`/api/trucks/${truck._id}`, { method: "DELETE" });
                    if (response.ok) {
                      setTrucks(trucks.filter((t) => t._id !== truck._id));
                    }
                  }}>
                    <Delete />
                  </IconButton>
                }>
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
              <IconButton onClick={async () => {
                if (!newCity.trim()) return;
                const response = await fetch("/api/cities", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: newCity.trim() })
                });
                if (response.ok) {
                  const createdCity: City = await response.json();
                  setCities([...cities, createdCity]);
                  setNewCity("");
                }
              }}>
                <Add />
              </IconButton>
            </Box>
            <List>
              {sortedCities.map((city) => (
                <ListItem key={city._id} secondaryAction={
                  <IconButton edge="end" onClick={async () => {
                    const response = await fetch(`/api/cities/${city._id}`, { method: "DELETE" });
                    if (response.ok) {
                      setCities(cities.filter((c) => c._id !== city._id));
                    }
                  }}>
                    <Delete />
                  </IconButton>
                }>
                  <ListItemText primary={city.name} />
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