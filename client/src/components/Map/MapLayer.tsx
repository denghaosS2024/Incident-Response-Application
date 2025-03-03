import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(56); // Default AppBar height
  const [tabbarHeight, setTabbarHeight] = useState(48); // Default Tabs height
  const [isFullPage, setIsFullPage] = useState(false);

  useEffect(() => {
    // Get the actual heights of navbar and tabbar
    const navbar = document.querySelector('header');
    const tabbar = document.querySelector('[role="tablist"]');
    
    if (navbar) {
      setNavbarHeight(navbar.clientHeight);
    }
    
    if (tabbar) {
      setTabbarHeight(tabbar.clientHeight);
    }

    // Check if we're in the full page map view or embedded in another component
    const path = window.location.pathname;
    setIsFullPage(path === '/map');
  }, []);

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  // Determine container height based on whether we're in full page or embedded
  const containerHeight = isFullPage 
    ? `calc(100vh - ${navbarHeight}px - ${tabbarHeight}px)`
    : '100%';

  // Menu positions differ based on view
  const groupMenuStyle = isFullPage 
    ? {
        left: '20px',
        bottom: '80px',
        top: 'auto',
        transform: 'none'
      }
    : {
        left: '20px',
        top: '45%',
        transform: 'translateY(-50%)'
      };

  const youMenuStyle = isFullPage
    ? {
        left: '20px',
        bottom: '100px',
        top: 'auto',
        marginBottom: '50px'
      }
    : {
        left: '20px',
        top: 'calc(45% + 100px)'
      };

  return (
    <div className={styles.mapLayerContainer} style={{ 
      height: containerHeight, 
      width: '100%', 
      maxWidth: '100%',
      overflow: 'hidden',
      position: 'relative',
      margin: 0,
      padding: 0
    }}>
      <Box 
        className={`${styles.levitatingList} ${!isVisible ? styles.hidden : ''}`}
        style={groupMenuStyle}
      >
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

      <Box 
        className={`${styles.youBox} ${!isVisible ? styles.hidden : ''}`}
        style={youMenuStyle}
      >
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

      <IconButton 
        className={styles.toggleButton} 
        onClick={toggleVisibility}
        sx={{
          position: 'absolute',
          bottom: '60px',
          left: '20px',
          zIndex: 100,
          bgcolor: 'white',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
          width: '40px',
          height: '40px'
        }}
      >
        {isVisible ? <RemoveIcon /> : <AddIcon />}
      </IconButton>

      <div className={styles.mapContainer} style={{ 
        height: '100%', 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        <Map />
      </div>
    </div>
  );
};

export default MapLayer; 