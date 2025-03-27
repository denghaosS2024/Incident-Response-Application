import React from 'react';
import { Typography, Box, List } from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import VehicleItem from './VehicleItem';

interface Vehicle {
  _id: string;
  name: string;
  usernames: string[];
  assignedCity: string;
  assignedIncident: string;
}

interface VehicleListProps {
  title: string;
  vehicles: Vehicle[];
  droppableId: string;
  vehicleType: 'Car' | 'Truck';
}

const VehicleList: React.FC<VehicleListProps> = ({ title, vehicles, droppableId, vehicleType }) => {
  const sortedVehicles = [...vehicles].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Typography variant="h6" style={{ marginTop: 16 }}>
        {title}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}></Box>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: '50px' }}
          >
            {sortedVehicles.map((vehicle, index) => (
              <VehicleItem
                key={vehicle.name}
                name={vehicle.name}
                usernames={vehicle.usernames}
                index={index}
                type={vehicleType}
              />
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </>
  );
};

export default VehicleList;
