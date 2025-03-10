import AddIcon from '@mui/icons-material/Add'
import BuildIcon from '@mui/icons-material/Build'
import ContactsIcon from '@mui/icons-material/Contacts'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import React, { useEffect, useState } from 'react'
import eventEmitter from '../../utils/eventEmitter'

import { AppDispatch } from '@/app/store'
import { RootState } from '@/utils/types'
import { useDispatch, useSelector } from 'react-redux'
import { loadContacts } from '../../features/contactSlice'
import IUser from '../../models/User'
import styles from '../../styles/MapLayer.module.css'
import getRoleIcon from '../common/RoleIcon'

const MapLayer: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(3)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [navbarHeight, setNavbarHeight] = useState<number>(56)
  const [tabbarHeight, setTabbarHeight] = useState<number>(48)
  const [isFullPage, setIsFullPage] = useState<boolean>(false)
  const [is911Page, setIs911Page] = useState<boolean>(false)

  // State to track toggling for dropdown items
  const [activeUtil, setActiveUtil] = useState<Record<string, boolean>>({})
  const [activeContact, setActiveContact] = useState<Record<string, boolean>>(
    {},
  )

  const [activeMainButtons, setActiveMainButtons] = useState({
    group: false,
    util: false,
    contacts: false,
    you: true, // "You" is active by default
  })

  const dispatch = useDispatch<AppDispatch>()
  const { contacts, loading } = useSelector(
    (state: RootState) => state.contactState,
  )
  const currentUserId = localStorage.getItem('uid')
  const users = contacts.filter((user: IUser) => user._id !== currentUserId)

  const currentUserRole = localStorage.getItem('role') || 'Citizen'
  const normalizedRole = currentUserRole.toLowerCase()
  let roleKey = 'Citizen'
  if (normalizedRole.includes('admin')) {
    roleKey = 'Administrator'
  } else if (normalizedRole.includes('nurse')) {
    roleKey = 'Nurse'
  } else if (normalizedRole.includes('fire')) {
    roleKey = 'Fire'
  }

  const roleUtilMapping: Record<string, string[]> = {
    Citizen: ['Areas', 'Hospitals', 'Pins', 'Pollution'],
    Fire: [
      'Areas',
      'Blocks',
      'Cars',
      'Hospitals',
      'Hydrants',
      'Incidents',
      'Pins',
      'Pollution',
      'SAR',
      'Trucks',
    ],
    Nurse: ['Areas', 'Hospitals', 'Incidents', 'Pins', 'Pollution', 'Trucks'],
    Administrator: [
      'Areas',
      'Blocks',
      'Cars',
      'Hospitals',
      'Hydrants',
      'Incidents',
      'Pins',
      'Pollution',
      'SAR',
      'Trucks',
    ],
  }

  const utilLayers = roleUtilMapping[roleKey] || []
  const sortedUtilLayers = [...utilLayers].sort()

  useEffect(() => {
    const navbar = document.querySelector('header')
    const tabbar = document.querySelector('[role="tablist"]')
    if (navbar) setNavbarHeight(navbar.clientHeight)
    if (tabbar) setTabbarHeight(tabbar.clientHeight)
    const path = window.location.pathname
    setIsFullPage(path === '/map')
    setIs911Page(path.includes('911'))
  }, [])

  useEffect(() => {
    dispatch(loadContacts())
  }, [dispatch])

  useEffect(() => {
    const handleSelectUtil = (select: boolean) => {
      if (select) {
        setSelectedIndex(1)
      }
    }
    eventEmitter.on('selectUtil', handleSelectUtil)

    return () => {
      eventEmitter.removeListener('selectUtil', handleSelectUtil)
    }
  }, [])

  // Listen for util visibility events to update the state from mapbox component
  useEffect(() => {
    const handleSelectUtil = ({
      layer,
      visible,
    }: {
      layer: string
      visible: boolean
    }) => {
      if (layer === 'Util') {
        setActiveMainButtons((prev) => ({
          ...prev,
          util: visible,
        }))

        // Open util dropdown if any of the util layers drops down a marker
        if (visible) {
          setSelectedIndex(1)
        }
      } else {
        // Update visibility of util layers when toggled from the map
        setActiveUtil((prev) => ({
          ...prev,
          [layer]: visible,
        }))
      }
    }

    eventEmitter.on('selectUtil', handleSelectUtil)

    return () => {
      eventEmitter.removeListener('selectUtil', handleSelectUtil)
    }
  }, [])

  // Auto-emit "you" clicked event on component mount
  useEffect(() => {
    eventEmitter.emit('you_button_clicked', true)
  }, [])

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (selectedIndex === index) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(index)
    }
  }

  // toggle visibility of contacts dropdown items
  const handleContactItemClick = (userId: string) => {
    setActiveContact((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // toggle visibility of util dropdown items
  const handleUtilItemClick = (layer: string) => {
    setActiveUtil((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
    handleUtilLayerClick(layer)
  }

  // emit toggle visibility event for util layers to show/hide on map
  const handleUtilLayerClick = (layer: string) => {
    switch (layer) {
      case 'Pins':
        eventEmitter.emit('toggle_pin')
        break
      case 'Blocks':
        eventEmitter.emit('toggle_roadblock')
        break
      case 'Hydrants':
        eventEmitter.emit('toggle_fireHydrant')
        break
      case 'Areas':
        eventEmitter.emit('area_util')
        break
      default:
        console.log(`Util Layer clicked: ${layer}`)
    }
  }

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev)
    if (!isVisible) setSelectedIndex(null)
  }

  const menuStyle = isFullPage
    ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
    : is911Page
      ? { left: '20px', bottom: '120px', top: 'auto', transform: 'none' }
      : { left: '20px', top: '45%', transform: 'translateY(-50%)' }

  const toggleButtonStyle = {
    position: 'absolute',
    bottom: '60px',
    left: '20px',
    zIndex: 1000,
    bgcolor: 'white',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    width: '40px',
    height: '40px',
  }

  // change background color of selected item
  const getButtonStyle = (index: number) => ({
    backgroundColor: selectedIndex === index ? '#F0F5FB' : 'transparent',
  })

  const handleMainButtonClick = (
    button: 'group' | 'util' | 'contacts' | 'you',
  ) => {
    setActiveMainButtons((prev) => {
      const newState = {
        ...prev,
        [button]: !prev[button],
      }

      // Emit you button clicked event
      // new state is true if the button is clicked and false otherwise
      if (button === 'you') {
        eventEmitter.emit('you_button_clicked', newState.you)
      }

      return newState
    })

    if (button === 'group') {
      if (selectedIndex === 0) {
        setSelectedIndex(null)
      } else {
        setSelectedIndex(0)
      }
    } else if (button === 'contacts') {
      if (selectedIndex === 2) {
        setSelectedIndex(null)
      } else {
        setSelectedIndex(2)
      }
    } else if (button === 'util') {
      if (selectedIndex === 1) {
        setSelectedIndex(null)
      } else {
        setSelectedIndex(1)
      }
    }
  }

  return (
    <div>
      <Box
        className={`${styles.levitatingList} ${!isVisible ? styles.hidden : ''}`}
        style={menuStyle}
      >
        <List component="nav" aria-label="map layer selection" dense>
          {/* Group */}
          <ListItemButton
            dense
            onClick={(e) => handleListItemClick(e, 0)}
            sx={getButtonStyle(0)}
          >
            <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Group"
              sx={{ color: 'black', fontSize: '0.875rem', marginLeft: 0 }}
            />
          </ListItemButton>

          {/* Util */}
          <ListItemButton
            dense
            onClick={() => handleMainButtonClick('util')}
            sx={{
              backgroundColor:
                selectedIndex === 1 || activeMainButtons.util
                  ? '#F0F5FB'
                  : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
              <BuildIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Util"
              sx={{ color: 'black', fontSize: '0.875rem' }}
            />
          </ListItemButton>

          {/* Inline util dropdown showing util layers for the current user role */}
          {selectedIndex === 1 && (
            <Box
              sx={{
                mt: 0,
                ml: 0,
                maxHeight: 120,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '2px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <List dense>
                {sortedUtilLayers.map((layer) => (
                  <ListItemButton
                    dense
                    key={layer}
                    onClick={() => handleUtilItemClick(layer)}
                    sx={{
                      backgroundColor: activeUtil[layer]
                        ? '#F0F5FB'
                        : 'transparent',
                      fontSize: '0.875rem',
                    }}
                  >
                    <ListItemText
                      primary={layer}
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {/* Contacts */}
          <ListItemButton
            dense
            onClick={(e) => handleListItemClick(e, 2)}
            sx={getButtonStyle(2)}
          >
            <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
              <ContactsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Contacts"
              sx={{ color: 'black', fontSize: '0.875rem', marginLeft: 0 }}
            />
          </ListItemButton>

          {/* Inline contacts dropdown */}
          {selectedIndex === 2 && (
            <Box
              sx={{
                mt: 0,
                ml: 0,
                maxHeight: 120,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '2px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <List dense>
                {loading ? (
                  <ListItemButton>
                    <ListItemText
                      primary="Loading..."
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ) : users.length === 0 ? (
                  <ListItemButton>
                    <ListItemText
                      primary="No contacts"
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ) : (
                  users.map((user: IUser) => (
                    <ListItemButton
                      dense
                      key={user._id}
                      onClick={() => handleContactItemClick(user._id)}
                      sx={{
                        backgroundColor: activeContact[user._id]
                          ? '#F0F5FB'
                          : 'transparent',
                        fontSize: '0.875rem',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
                        {getRoleIcon(user.role)}
                      </ListItemIcon>
                      <ListItemText
                        primary={user.username}
                        sx={{ fontSize: '0.875rem' }}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </Box>
          )}

          {/* You */}
          <ListItemButton
            dense
            onClick={() => handleMainButtonClick('you')}
            sx={{
              backgroundColor: activeMainButtons.you
                ? '#F0F5FB'
                : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="You"
              sx={{ color: 'black', fontSize: '0.875rem' }}
            />
          </ListItemButton>
        </List>
      </Box>

      <IconButton
        className={styles.toggleButton}
        onClick={toggleVisibility}
        sx={toggleButtonStyle}
      >
        {isVisible ? (
          <RemoveIcon fontSize="small" />
        ) : (
          <AddIcon fontSize="small" />
        )}
      </IconButton>
    </div>
  )
}

export default MapLayer
