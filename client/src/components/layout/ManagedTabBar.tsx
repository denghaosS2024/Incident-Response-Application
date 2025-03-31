import { setHasGroupNotification, setHasNewIncident } from '@/redux/notifySlice'
import {
  Hotel as BedIcon,
  LocalFireDepartment as FirefighterIcon,
  Home,
  LocationOn,
  Message,
  LocalHospital as NurseIcon,
  PermContactCalendar,
  LocalPolice as PoliceIcon,
} from '@mui/icons-material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import Groups2Icon from '@mui/icons-material/Groups2'
import { Badge, Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearAllAlerts } from '../../redux/messageSlice'
import { AppDispatch, RootState } from '../../redux/store'
import TabBar, { Link } from '../common/TabBar'
export default function ManagedTabBar() {
  const dispatch = useDispatch<AppDispatch>()
  const role = localStorage.getItem('role') ?? 'Citizen'
  const notifyState = useSelector((state: RootState) => state.notifyState)
  // Check if there are any unread messages
  const alerts = useSelector((state: RootState) => state.messageState.alerts)
  const hasUnreadMessages = Object.values(alerts).some((alert) => alert)
  //   // check if there are any group notifications
  //   const [hasGroupNotification, setHasGroupNotification] = useState(false)
  //   // check if there are any new incidents
  //   const [hasNewIncident, setHasNewIncident] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState<string | null>('home')

  const roleTabs: Record<string, Link> = {
    Citizen: { prefix: '/', key: 'home', icon: <Home />, to: '/' },
    Administrator: { prefix: '/', key: 'home', icon: <Home />, to: '/' },
    Dispatch: {
      prefix: '/',
      key: 'home',
      icon: (
        <img
          src="/911-icon-selected.png"
          alt="Selected 911 Icon"
          style={{ width: '28px', height: '28px', borderRadius: '8px' }}
        />
      ),
      to: '/',
    },
    Police: { prefix: '/', key: 'home', icon: <PoliceIcon />, to: '/' },
    Fire: { prefix: '/', key: 'home', icon: <FirefighterIcon />, to: '/' },
    Nurse: { prefix: '/', key: 'home', icon: <NurseIcon />, to: '/' },
  }

  const homeTab = {
    prefix: '/',
    key: 'home',
    icon:
      role === 'Dispatch' ? (
        selectedTab === 'home' ? (
          <img
            src="/911-icon-selected.png"
            alt="Selected 911 Icon"
            style={{ width: '28px', height: '28px', borderRadius: '8px' }}
          />
        ) : (
          <img
            src="/911-icon.png"
            alt="911 Icon"
            style={{ width: '28px', height: '28px', borderRadius: '8px' }}
          />
        )
      ) : (
        roleTabs[role]?.icon || <Home />
      ),
    to: '/',
    onClick: () => setSelectedTab('home'),
  }

  const additionalTabs: Link[] = [
    ...(role === 'Citizen' || role == 'Administrator'
      ? [
          {
            prefix: '/reach911',
            key: 'reach911',
            icon:
              selectedTab === 'reach911' ? (
                <img
                  src="/911-icon-selected.png"
                  alt="Selected 911 Icon"
                  style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src="/911-icon.png"
                  alt="911 Icon"
                  style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                />
              ),
            to: '/reach911',
            onClick: () => setSelectedTab('reach911'),
          },
        ]
      : []),
  ]

  const orderedTabs: Link[] = [
    homeTab,
    {
      prefix: '/messages',
      key: 'msg',
      icon: hasUnreadMessages ? (
        <Badge badgeContent="!" color="error">
          <Message />
        </Badge>
      ) : (
        <Message />
      ),
      to: '/messages',
      onClick: () => {
        dispatch(clearAllAlerts())
        setSelectedTab('msg')
      },
    },
    {
      prefix: '/contacts',
      key: 'contact',
      icon: <PermContactCalendar />,
      to: '/contacts',
      onClick: () => setSelectedTab('contact'),
    },
    {
      prefix: '/groups',
      key: 'groups',
      icon: notifyState.hasGroupNotification ? (
        <Groups2Icon style={{ color: 'red' }} />
      ) : (
        <Groups2Icon />
      ),
      to: '/groups',
      onClick: () => {
        dispatch(setHasGroupNotification(false))
        setSelectedTab('groups')
      },
    },
    {
      prefix: '/map',
      key: 'map',
      icon: <LocationOn />,
      to: '/map',
      onClick: () => setSelectedTab('map'),
    },
    ...additionalTabs,
  ]
  useEffect(() => {
    const path = window.location.pathname
    const matchingTab = orderedTabs.find((tab) => tab.to === path)

    if (matchingTab) {
      setSelectedTab(matchingTab.key)
    }
  }, [window.location.pathname])

  const hasIncidentTab = orderedTabs.some((tab) => tab.key === 'incidents')

  if (!hasIncidentTab && ['Dispatch', 'Police', 'Fire'].includes(role)) {
    orderedTabs.push({
      prefix: '/incidents',
      key: 'incidents',
      icon: notifyState.hasNewIncident ? (
        <Box position="relative">
          <ErrorOutlineIcon sx={{ color: 'error.main' }} />
          <Box
            sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'error.main',
            }}
          />
        </Box>
      ) : (
        <ErrorOutlineIcon />
      ),
      to: '/incidents',
      onClick: () => {
        dispatch(setHasNewIncident(false))
        setSelectedTab('incidents')
      },
    })
  }

  if (role === 'Nurse') {
    orderedTabs.push({
      prefix: '/patients',
      key: 'patients',
      icon: <BedIcon />,
      to: '/patients',
      onClick: () => setSelectedTab('patients'),
    })
  }

  return <TabBar links={orderedTabs} />
}
