import { ISarTask } from '@/models/Incident'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography
} from '@mui/material'
import React, { useState } from 'react'
import Map from '../../Map/Mapbox'

interface AddressBarProps {
  task?: ISarTask
}

const AddressBar: React.FC<AddressBarProps> = ({ task }) => {
  const [mapOpen, setMapOpen] = useState(false);
  
  // Get address and coordinates from the task
  const address = task?.location || 'No Address'
  const coordinates = task?.coordinates || { longitude: -74.0060, latitude: 40.7128 }
  
  // Open map dialog
  const openMapDialog = (): void => {
    setMapOpen(true);
  };
  
  // Close map dialog
  const closeMapDialog = (): void => {
    setMapOpen(false);
  };

  return (
    <>
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
          onClick={openMapDialog}
          sx={{
            minWidth: '64px',
            marginLeft: 2
          }}
        >
          Map
        </Button>
      </Paper>
      
      {/* Map Dialog */}
      <Dialog
        open={mapOpen}
        onClose={closeMapDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Location Map
          <IconButton
            aria-label="close"
            onClick={closeMapDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: '100%',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          >
            <div style={{ height: '100%', width: '100%' }}>
              <Map
                showMarker={true}
                disableGeolocation={true}
                // Remove the initialLocation prop as it doesn't exist on the Map component
              />
            </div>
            
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocationOnIcon color="error" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper' }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              {address}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMapDialog} color="primary" variant="contained">
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddressBar