import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PushPinIcon from '@mui/icons-material/PushPin';
import CloudIcon from '@mui/icons-material/Cloud';
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt';
import BlockIcon from '@mui/icons-material/Block';
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
          icon={<PushPinIcon />}
          onClick={onDropPin}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<CloudIcon />}
          onClick={onDropRoadblock}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<FireHydrantAltIcon />}
          onClick={onDropFireHydrant}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
        <BottomNavigationAction
          icon={<BlockIcon />}
          onClick={onDropAirQuality}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MapDrop;
