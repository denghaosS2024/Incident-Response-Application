import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import ContactsIcon from '@mui/icons-material/Contacts';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ReportProblem from '@mui/icons-material/ReportProblem';
import LocalTaxi from '@mui/icons-material/LocalTaxi';
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import Map from './Mapbox';

import { useDispatch, useSelector } from 'react-redux';
import { loadContacts } from '../../features/contactSlice';
import { AppDispatch } from '@/app/store';
import { RootState } from '@/utils/types';
import IUser from '../../models/User';
import styles from '../../styles/MapLayer.module.css';

const MapLayer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(2);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [navbarHeight, setNavbarHeight] = useState<number>(56);
  const [tabbarHeight, setTabbarHeight] = useState<number>(48);
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [is911Page, setIs911Page] = useState<boolean>(false);

  // Using Redux hooks to dispatch actions and select state excluding the current user.
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, loading } = useSelector((state: RootState) => state.contactState);
  const currentUserId = localStorage.getItem('uid');
  const users = contacts.filter((user: IUser) => user._id !== currentUserId);

  // Get navbar and tabbar heights, and set page mode.
  useEffect(() => {
    const navbar = document.querySelector('header');
    const tabbar = document.querySelector('[role="tablist"]');
    if (navbar) setNavbarHeight(navbar.clientHeight);
    if (tabbar) setTabbarHeight(tabbar.clientHeight);
    const path = window.location.pathname;
    setIsFullPage(path === '/map');
    setIs911Page(path.includes('911'));
  }, []);

  useEffect(() => {
    dispatch(loadContacts());
  }, [dispatch]);

  const handleListItemClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (index === 2) {
      setSelectedIndex(selectedIndex === 2 ? null : 2);
    } else {
      setSelectedIndex(index);
    }
  };

  // TODO: Handle contact click for future implementation.
  const handleContactClick = (userId: string) => {
    console.log(`Contact clicked: ${userId}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Dispatch':
        return <ReportProblem sx={{ color: 'red', marginRight: '8px' }} />;
      case 'Police':
        return <LocalTaxi sx={{ color: 'red', marginRight: '8px' }} />;
      case 'Fire':
        return <LocalFireDepartment sx={{ color: 'red', marginRight: '8px' }} />;
      case 'Nurse':
        return <HealthAndSafety sx={{ color: 'red', marginRight: '8px' }} />;
      default:
        return null;
    }
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
    if (!isVisible) setSelectedIndex(null);
  };

  // Determine container height based on full page vs. embedded.
  const containerHeight = isFullPage
    ? `calc(100vh - ${navbarHeight}px - ${tabbarHeight}px)`
    : '100%';

  // Main menu positioning.
  const menuStyle = isFullPage
    ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
    : is911Page
      ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
      : { left: '20px', top: '45%', transform: 'translateY(-50%)' };

  const toggleButtonStyle = {
    position: 'absolute',
    bottom: '60px',
    left: '20px',
    zIndex: 1000,
    bgcolor: 'white',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    width: '40px',
    height: '40px',
  };

  return (
    <div
      className={styles.mapLayerContainer}
      style={{
        height: containerHeight,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        className={`${styles.levitatingList} ${!isVisible ? styles.hidden : ''}`}
        style={{
          ...menuStyle,
          display: is911Page ? 'none' : 'block'
        }}
      >
        <List component="nav" aria-label="map layer selection">
          {/* Group */}
          <ListItemButton
            onClick={(e) => handleListItemClick(e, 0)}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Group" sx={{ color: 'black' }} />
          </ListItemButton>

          {/* Util */}
          <ListItemButton
            onClick={(e) => handleListItemClick(e, 1)}
          >
            <ListItemIcon>
              <BuildIcon />
            </ListItemIcon>
            <ListItemText primary="Util" sx={{ color: 'black' }} />
          </ListItemButton>

          {/* Contacts */}
          <ListItemButton
            onClick={(e) => handleListItemClick(e, 2)}
          >
            <ListItemIcon>
              <ContactsIcon />
            </ListItemIcon>
            <ListItemText primary="Contacts" sx={{ color: 'black' }} />
          </ListItemButton>

          {/* Inline contacts dropdown */}
          {selectedIndex === 2 && (
            <Box>
              <List>
                {loading ? (
                  <ListItem>
                    <ListItemText primary="Loading..." />
                  </ListItem>
                ) : users.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No contacts" />
                  </ListItem>
                ) : (
                  users.map((user: IUser) => (
                    <ListItemButton
                      key={user._id}
                      onClick={() => handleContactClick(user._id)}
                    >
                      <ListItemIcon>{getRoleIcon(user.role)}</ListItemIcon>
                      <ListItemText primary={user.username} />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          )}

          {/* You */}
          <ListItemButton
            onClick={(e) => handleListItemClick(e, 3)}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="You" sx={{ color: 'black' }} />
          </ListItemButton>
        </List>
      </Box>

      <IconButton
        className={styles.toggleButton}
        onClick={toggleVisibility}
        sx={{
          ...toggleButtonStyle,
          display: is911Page ? 'none' : 'flex'
        }}
      >
        {isVisible ? <RemoveIcon /> : <AddIcon />}
      </IconButton>

      <div
        className={styles.mapContainer}
        style={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Map showMarker={is911Page} />
      </div>
    </div>
  );
};

export default MapLayer;
