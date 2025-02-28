import React, { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ListItemIcon, IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import ContactsIcon from '@mui/icons-material/Contacts';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Map from './Mapbox';
import styles from '../../styles/MapLayer.module.css';

const MapLayer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true); 

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className={styles.mapLayerContainer}>

      <Box className={`${styles.levitatingList} ${!isVisible ? styles.hidden : ''}`}>
        <List component="nav" aria-label="map layer selection">
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={() => handleListItemClick(0)}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Group" />
          </ListItemButton>

          <ListItemButton
            selected={selectedIndex === 1}
            onClick={() => handleListItemClick(1)}
          >
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Util" />
          </ListItemButton>

          <ListItemButton
            selected={selectedIndex === 2}
            onClick={() => handleListItemClick(2)}
          >
            <ListItemIcon>
              <ContactsIcon />
            </ListItemIcon>
            <ListItemText primary="Contacts" />
          </ListItemButton>
        </List>
      </Box>

      <Box className={`${styles.youBox} ${!isVisible ? styles.hidden : ''}`}>
        <List component="nav" aria-label="you-section">
          <ListItemButton
            selected={selectedIndex === 3}
            onClick={() => handleListItemClick(3)}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="You" />
          </ListItemButton>
        </List>
      </Box>

      <IconButton className={styles.toggleButton} onClick={toggleVisibility}>
        {isVisible ? <RemoveIcon /> : <AddIcon />}
      </IconButton>

      <div className={styles.mapContainer}>
        <Map />
      </div>
    </div>
  );
};

export default MapLayer;
