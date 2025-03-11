import { DirectionsCar, ExpandMore, FireExtinguisher, LocalPolice, Place } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import React from 'react';

interface Vehicle {
  _id: string;
  name: string;
  assignedCity: string;
}

interface Personnel {
  _id: string;
  name: string;
  assignedCity: string;
  role: 'Fire' | 'Police';
  assignedVehicleTimestamp?: string;
  assignedCar?: string;
  assignedTruck?: string;
}

interface CityAssignment {
  cars: Vehicle[];
  trucks: Vehicle[];
  personnel: Personnel[];
}

interface CityAssignmentsContainerProps {
  cityName: string;
  data: CityAssignment;
}

const CityAssignmentsContainer: React.FC<CityAssignmentsContainerProps> = ({ cityName, data }) => {
  return (
    <Box sx={{ padding: 3 }}>
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
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
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Fire Department" avatar={<Avatar sx={{ bgcolor: 'error.main' }}><FireExtinguisher /></Avatar>} sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }} />
                <CardContent>
                  <Typography variant="h6">Personnel</Typography>
                  <List>
                    {data.personnel.filter(p => p.role === 'Fire').map(person => (
                      <ListItem key={person._id}>
                        <ListItemAvatar><Avatar sx={{ bgcolor: 'error.main' }}><FireExtinguisher /></Avatar></ListItemAvatar>
                        <ListItemText primary={`${person.name}${person.assignedTruck ? ` ( ${person.assignedTruck} - ${format(new Date(person.assignedVehicleTimestamp!), 'MM.dd h:mma')} )` : ''}`} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="h6">Trucks</Typography>
                  <List>
                    {data.trucks.map(truck => (
                      <ListItem key={truck._id}>
                        <FireExtinguisher color="error" sx={{ mr: 1 }} />
                        <Typography>{truck.name}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Police Department" avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><LocalPolice /></Avatar>} sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }} />
                <CardContent>
                  <Typography variant="h6">Personnel</Typography>
                  <List>
                    {data.personnel.filter(p => p.role === 'Police').map(person => (
                      <ListItem key={person._id}>
                        <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.main' }}><LocalPolice /></Avatar></ListItemAvatar>
                        <ListItemText primary={`${person.name}${person.assignedCar ? ` ( ${person.assignedCar} - ${format(new Date(person.assignedVehicleTimestamp!), 'MM.dd h:mma')} )` : ''}`} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="h6">Cars</Typography>
                  <List>
                    {data.cars.map(car => (
                      <ListItem key={car._id}>
                        <DirectionsCar color="primary" sx={{ mr: 1 }} />
                        <Typography>{car.name}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CityAssignmentsContainer;