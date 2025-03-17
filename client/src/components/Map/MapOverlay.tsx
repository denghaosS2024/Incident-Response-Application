import BuildIcon from '@mui/icons-material/Build'
import ContactsIcon from '@mui/icons-material/Contacts'
import GroupIcon from '@mui/icons-material/Group'
import PersonIcon from '@mui/icons-material/Person'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import React, { useEffect, useState } from 'react'
import eventEmitter from '../../utils/eventEmitter'

import LayersIcon from '@mui/icons-material/Layers'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import IconButton from '@mui/material/IconButton'
import { useDispatch, useSelector } from 'react-redux'
import IChannel from '../../models/Channel'
import IUser from '../../models/User'
import { loadContacts } from '../../redux/contactSlice'
import { AppDispatch, RootState } from '../../redux/store'
import styles from '../../styles/MapOverlay.module.css'
import getRoleIcon from '../common/RoleIcon'
import MapGroupItems from './MapGroupItems'
import MapOverlayUtil from './MapOverlayUtil'

const MapOverlay: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(3)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [navbarHeight, setNavbarHeight] = useState<number>(56)
  const [tabbarHeight, setTabbarHeight] = useState<number>(48)
  const [isFullPage, setIsFullPage] = useState<boolean>(false)
  const [is911Page, setIs911Page] = useState<boolean>(false)

  // State to track toggling for dropdown items
  const [activeUtil, setActiveUtil] = useState<Record<string, boolean>>({})
  const [activeContact, setActiveContact] = useState<Record<string, boolean>>(
    {},
  )
  const [activeGroup, setActiveGroup] = useState<Record<string, boolean>>({})

  // State for storing groups
  const [myManagingGroups, setOwnedGroups] = useState<IChannel[]>([])
  const [myParticipatingGroups, setActiveGroups] = useState<IChannel[]>([])
  const [groupsLoading, setGroupsLoading] = useState<boolean>(true)

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

  const utilLayers = MapOverlayUtil.getUtilItems().sort()

  const handleSelectUtil = (layer: string, visible: boolean) => {
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

  useEffect(() => {
    // Configure overlay dimensions based on current page
    // These are dead code
    const navbar = document.querySelector('header')
    const tabbar = document.querySelector('[role="tablist"]')
    if (navbar) setNavbarHeight(navbar.clientHeight)
    if (tabbar) setTabbarHeight(tabbar.clientHeight)
    const path = window.location.pathname

    //Fetch groups
    setGroupsLoading(true)

    MapOverlayUtil.fetchGroups()
      .then((groups) => {
        if (groups) {
          setActiveGroups(groups.active)
          setOwnedGroups(groups.owned)
        }
      })
      .finally(() => setGroupsLoading(false))

    setIsFullPage(path === '/map')
    setIs911Page(path.includes('911'))
  }, [])

  useEffect(() => {
    dispatch(loadContacts())
  }, [dispatch])

  // Listen for util visibility events to update the state from mapbox component
  useEffect(() => {
    eventEmitter.on('selectUtil', handleSelectUtil)

    return () => {
      eventEmitter.removeListener('selectUtil', handleSelectUtil)
    }
  }, [])

  // Auto-emit "you" clicked event on component mount
  useEffect(() => {
    eventEmitter.emit('you_button_clicked', true)
  }, [])

  const handleContactsClick = () => {
    if (selectedIndex === 2) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(2)
    }
  }

  // toggle visibility of contacts dropdown items
  const handleContactItemClick = (userId: string) => {
    setActiveContact((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // toggle visibility of group dropdown items
  const handleGroupItemClick = (groupId: string) => {
    setActiveGroup((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
    handleGroupSelected(groupId)
  }

  // TODO: handle group selected future implementation
  const handleGroupSelected = (groupId: string) => {
    console.log(`Group selected: ${groupId}`)
  }

  // toggle visibility of util dropdown items
  const handleUtilItemClick = (layer: string) => {
    setActiveUtil((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
    MapOverlayUtil.onUtilLayerClick(layer)
  }

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev)
    if (!isVisible) setSelectedIndex(null)
  }

  const menuStyle = MapOverlayUtil.getMenuStyle(isFullPage, is911Page)

  // change background color of selected item
  const getButtonStyle = (index: number) => ({
    backgroundColor: selectedIndex === index ? '#F0F5FB' : 'transparent',
  })

  const handleMainButtonClick = (
    buttonText: 'group' | 'util' | 'contacts' | 'you',
  ) => {
    // Index of sub-pages in the overlay
    const stateMapping: Record<string, number> = {
      group: 0,
      util: 1,
      contacts: 2,
    }

    setActiveMainButtons((prev) => {
      const newState = {
        ...prev,
        [buttonText]: !prev[buttonText],
      }

      // Emit you button clicked event
      // new state is true if the button is clicked and false otherwise
      if (buttonText === 'you') {
        eventEmitter.emit('you_button_clicked', newState.you)
      }

      return newState
    })

    if (buttonText === 'you') {
      return
    } else if (stateMapping[buttonText] === selectedIndex) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(stateMapping[buttonText])
    }
  }

  return (
    <div>
      <Box
        className={`${styles.levitatingList} ${!isVisible ? 'hidden' : ''}`}
        style={menuStyle}
      >
        <List component="nav" aria-label="map layer selection">
          {/* Group */}
          <ListItemButton
            dense
            onClick={() => handleMainButtonClick('group')}
            sx={{
              backgroundColor:
                selectedIndex === 0 || activeMainButtons.group
                  ? '#F0F5FB'
                  : 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: '32px', mr: 1 }}>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Group"
              sx={{ color: 'black', fontSize: '0.875rem', marginLeft: 0 }}
            />
          </ListItemButton>

          {/* Inline group dropdown showing groups */}
          {selectedIndex === 0 && (
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
                {groupsLoading ? (
                  <ListItemButton>
                    <ListItemText
                      primary="Loading..."
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ) : myManagingGroups.length === 0 &&
                  myParticipatingGroups.length === 0 ? (
                  <ListItemButton>
                    <ListItemText
                      primary="No groups"
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ) : (
                  <>
                    <MapGroupItems
                      groups={myManagingGroups}
                      activeGroup={activeGroup}
                      onItemClick={handleGroupItemClick}
                    />
                    <MapGroupItems
                      groups={myParticipatingGroups}
                      activeGroup={activeGroup}
                      onItemClick={handleGroupItemClick}
                    />
                  </>
                )}
              </List>
            </Box>
          )}

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
                {utilLayers.map((layer) => (
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
            onClick={handleContactsClick}
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
                ) : MapOverlayUtil.getUsers(contacts).length === 0 ? (
                  <ListItemButton>
                    <ListItemText
                      primary="No contacts"
                      sx={{ fontSize: '0.875rem' }}
                    />
                  </ListItemButton>
                ) : (
                  MapOverlayUtil.getUsers(contacts).map((user: IUser) => (
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

      {/* Overlay Toggle */}

      <div className="bg-white">
        <IconButton
          className={`${styles.toggleButton}`}
          onClick={toggleVisibility}
          sx={{
            position: 'absolute',
            bottom: '60px',
            left: '20px',
            zIndex: 1000,
          }}
        >
          {isVisible ? (
            <LayersClearIcon fontSize="small" />
          ) : (
            <LayersIcon fontSize="small" />
          )}
        </IconButton>
      </div>
    </div>
  )
}

export default MapOverlay
