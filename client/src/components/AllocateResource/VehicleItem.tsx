import React from 'react';
import { ListItem, ListItemText, Box, ListItemAvatar, Avatar, Typography } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';
import getRoleIcon from '../../components/common/RoleIcon';

interface VehicleItemProps {
  name: string;
  usernames: string[];
  index: number;
  type: 'Car' | 'Truck';
}

const VehicleItem: React.FC<VehicleItemProps> = ({ name, usernames, index, type }) => {
  const draggableId = `${type}::${name}`;
  const sortedUsernames = [...(usernames || [])].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  
  const roleType = type === 'Car' ? 'Police' : 'Fire';

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
            primary={name}
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
            {sortedUsernames && sortedUsernames.length > 0 ? (
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
                      {getRoleIcon(roleType)}
                    </Avatar>
                  </ListItemAvatar>
                  <Typography variant="body2" color="text.secondary">
                    {username}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 1, py: 0.5 }}>
                No personnel assigned
              </Typography>
            )}
          </Box>
        </ListItem>
      )}
    </Draggable>
  );
};

export default VehicleItem;
