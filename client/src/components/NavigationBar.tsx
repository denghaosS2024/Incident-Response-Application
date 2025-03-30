import { ArrowBack, MoreVert as More } from '@mui/icons-material'
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import request, { IRequestError } from '../utils/request'

export interface IProps {
  /**
   * Whether to show the back button
   */
  showBackButton?: boolean
  /**
   * Function to be called when the back button is clicked
   */
  onBack?: () => void
  /**
   * Whether to show the menu button
   */
  showMenu?: boolean
}

const NavigationBar: FunctionComponent<IProps> = ({
  showBackButton,
  onBack,
  showMenu,
}) => {
  const [openMenu, setOpenMenu] = useState(false)
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement>()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [URLSearchParams] = useSearchParams()
  const name = URLSearchParams.get('name')
  const role = localStorage.getItem('role') || 'Citizen'

  const onBackHandler = onBack || (() => navigate(-1))

  const pathname = location.pathname

  // Add "/organization" here to display "Organization"
  const pageTitles: Record<string, string> = {
    '/messages': 'Messages',
    '/contacts': 'Contacts',
    '/groups': 'Groups',
    '/reach911': '911 Call',
    '/incidents': 'Incidents',
    '/organization': 'Organization',
    '/organization/view': 'Organization',
    '/map': 'Map',
    '/register-hospital': 'Hospital',
    '/hospitals': 'Hospitals',
    '/resources': 'Resources',
    '/find-hospital': 'Find Hospital',
    '/dashboard': 'Dashboard',
  }

  const roleTitles: Record<string, string> = {
    Citizen: 'IR Citizen',
    Dispatch: 'IR Dispatch',
    Police: 'IR Police',
    Fire: 'IR Fire',
    Nurse: 'IR Nurse',
  }

  let title = pageTitles[pathname] || 'Incident Response'

  // If user is Fire or Police and path is /reach911, override title to "Incidents"
  if (
    pathname === '/reach911' &&
    (role === 'Fire' || role === 'Police' || role === 'Dispatch')
  ) {
    title = 'Incidents'
  }
  if (pathname === '/incidents/report') {
    title = 'Incident Report'
  }

  if (pathname.startsWith('/sar-task')) {
    title = 'SAR Task'
  }

  if (pathname.startsWith('/messages/') && name) {
    title = `${name} Messages`
  }
  if (pathname.startsWith('/profile')) {
    title = 'Profile'
  }

  if (pathname.startsWith('/map')) {
    title = 'Map'
  }

  if (pathname.startsWith('/groups/')) {
    title = 'Group'
  }

  if (pathname === '/') {
    title = roleTitles[role] || 'IR Citizen'
  }

  const openMenuHandler = (anchor: HTMLElement) => {
    setOpenMenu(true)
    setMenuAnchor(anchor)
  }

  const closeMenu = () => {
    setOpenMenu(false)
  }

  const quit = async () => {
    console.log('Logout clicked')
    try {
      const username = localStorage.getItem('username')
      const role = localStorage.getItem('role')

      // Make a POST request to the logout endpoint
      const response = await request('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, role }),
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Handle error (e.g., show a notification)
    } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('uid')
    localStorage.removeItem('incidentState')
    localStorage.removeItem('911Step')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    navigate('/login')
    }
  }

  const profile = () => {
    navigate('/profile')
  }

  const hospitalsDirectory = () => {
    navigate('/hospitals')
  }

  const findHospital = () => {
    navigate('/find-hospital')
  }

  const navigateToOrganization = () => {
    // Get the user's role from localStorage
    const userRole = localStorage.getItem('role') || ''

    // Use the same role-based logic
    if (['Dispatch', 'Police', 'Fire'].includes(userRole)) {
      // Responders see the ViewOrganization component
      navigate('/organization/view')
    } else {
      // Administrators see the Organization component
      navigate('/organization')
    }

    // Close the menu after navigation
    closeMenu()
  }

  const navigateToDashboard = () => {
    if (['Dispatch', 'Police', 'Fire'].includes(role)) {
      navigate('/dashboard')
    }
    closeMenu()
  }

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBackHandler}
            size="large"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography style={{ flex: 1 }} variant="h6" color="inherit">
          {title}
        </Typography>
        {showMenu && (
          <IconButton
            color="inherit"
            edge="end"
            onClick={(e) => openMenuHandler(e.currentTarget)}
            size="large"
          >
            <More />
          </IconButton>
        )}
        <Menu open={openMenu} anchorEl={menuAnchor} onClose={closeMenu}>
          {(role === 'Dispatch' ||
            role === 'Police' ||
            role === 'Fire' ||
            role === 'Administrator') && (
            <MenuItem onClick={navigateToOrganization}>Organization</MenuItem>
          )}
          {(role === 'Nurse' || role === 'Police' || role === 'Fire') && (
            <MenuItem onClick={hospitalsDirectory}>Hospital Directory</MenuItem>
          )}
          {(role === 'Police' || role === 'Fire') && (
            <MenuItem onClick={findHospital}>Find Hospital</MenuItem>
          )}
          {(role === 'Dispatch' ||
            role === 'Police' ||
            role === 'Fire') && (
            <MenuItem onClick={navigateToDashboard}>Dashboard</MenuItem>
          )}
          <MenuItem onClick={profile}>Profile</MenuItem>
          <MenuItem onClick={quit}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default NavigationBar
