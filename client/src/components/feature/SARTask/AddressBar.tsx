import { ISarTask } from '@/models/Incident'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import {
  Box,
  Button,
  Paper,
  Typography
} from '@mui/material'
import React from 'react'

interface AddressBarProps {
  task?: ISarTask
}

const AddressBar: React.FC<AddressBarProps> = ({ task }) => {
  // Get address and coordinates from the task
  const address = task?.location || 'No Address'
  
  // Get coordinates from task.coordinates or use default
  const latitude = task?.coordinates?.latitude || 40.7128
  const longitude = task?.coordinates?.longitude || -74.0060
  
  // Navigate to map page with coordinates
  const navigateToMap = (): void => {
    window.location.href = `/map?lat=${latitude}&lng=${longitude}`;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: '0px',
        width: '100%',
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        flex: 1
      }}>
        <LocationOnIcon
          color="primary"
          fontSize="small"
          sx={{ marginRight: 1 }}
        />
        <Typography
          variant="body1"
          noWrap
          title={address} // Shows full address on hover
          sx={{
            flexGrow: 1
          }}
        >
          {address}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="small"
        onClick={navigateToMap}
        sx={{
          minWidth: '64px',
          marginLeft: 2
        }}
      >
        Map
      </Button>
    </Paper>
  )
}

export default AddressBar