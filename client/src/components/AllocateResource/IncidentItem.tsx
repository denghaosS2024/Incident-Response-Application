import React from 'react';
import { ListItem, Box, ListItemText, Typography } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import IIncident from '@/models/Incident';
import getRoleIcon from '@/components/common/RoleIcon';
import { ListItemAvatar, Avatar } from '@mui/material';

interface IncidentItemProps {
  incident: IIncident;
}

const IncidentItem: React.FC<IncidentItemProps> = ({ incident }) => {
  const renderAssignedVehicles = () => {
    if (!incident.assignedVehicles || incident.assignedVehicles.length === 0) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', pl: 1 }}
        >
          No vehicles assigned
        </Typography>
      );
    }

    return incident.assignedVehicles.map((vehicle, index) => {
      const usernames: string[] = vehicle.usernames;
      const draggableId = `${vehicle.type}::${vehicle.name}`;
      const roleType = vehicle.type === 'Car' ? 'Police' : 'Fire';
      
      return (
        <Draggable key={draggableId} draggableId={draggableId} index={index}>
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
                primary={vehicle.name}
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
                {usernames && usernames.length > 0 ? (
                  usernames.map((username, i) => (
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
                          {getRoleIcon(roleType)}
                        </Avatar>
                      </ListItemAvatar>
                      <Typography variant="body2" color="text.secondary">
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
      );
    });
  };

  return (
    <Droppable droppableId={`incident-${incident.incidentId}`}>
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
            {renderAssignedVehicles()}
          </Box>
          {provided.placeholder}
        </ListItem>
      )}
    </Droppable>
  );
};

export default IncidentItem;
