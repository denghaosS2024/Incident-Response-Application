import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LayersIcon from '@mui/icons-material/Layers';
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import { useState } from 'react';

interface MapDropProps {
    onDropPin: () => void;     // Center map on user's location
    onDropRoadblock: () => void;  // Toggle layers visibility
    onDropFireHydrant: () => void;        // Add a pin on the map
    onDropAirQuality: () => void;   // Switch map styles
  }

const MapDrop: React.FC<MapDropProps> = ({ onDropPin, onDropRoadblock, onDropFireHydrant, onDropAirQuality }) => {
  const [value, setValue] = useState(0);

  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BottomNavigationAction
          icon={<MyLocationIcon />}
          onClick={onDropPin}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<LayersIcon />}
          onClick={onDropRoadblock}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<PlaceIcon />}
          onClick={onDropFireHydrant}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<MapIcon />}
          onClick={onDropAirQuality}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MapDrop;
