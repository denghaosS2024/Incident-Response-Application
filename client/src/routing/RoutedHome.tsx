// External Imports
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
import { Badge, Box, Modal, Typography, keyframes } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import IMessage from '../models/Message'

// IR App
import IrSnackbar from '../components/IrSnackbar'
import NavigationBar from '../components/NavigationBar'
import TabBar, { Link } from '../components/TabBar'
import { loadContacts } from '../redux/contactSlice'
import {
  acknowledgeMessage,
  addMessage,
  clearAllAlerts,
  updateMessage,
} from '../redux/messageSlice'
import { AppDispatch, RootState } from '../redux/store'
import SocketClient from '../utils/Socket'

interface IProps {
  showBackButton?: boolean
  // Set this to true to hide the menu in subpages such as the chat room view.
  isSubPage?: boolean
}

export default function RoutedHome({ showBackButton, isSubPage }: IProps) {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = localStorage.getItem('token') ? true : false
  const role = localStorage.getItem('role') || 'Citizen'
  // Check if there are any unread messages
  const alerts = useSelector((state: RootState) => state.messageState.alerts)
  const hasUnreadMessages = Object.values(alerts).some((alert) => alert)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [bgColor, setBgColor] = useState('black')
  const [textColor, setTextColor] = useState('white')
  // check if there are any group notifications
  const [hasGroupNotification, setHasGroupNotification] = useState(false)
  const [currentAlertMessageId, setCurrentAlertMessageId] = useState('')
  const [currentChannelId, setCurrentChannelId] = useState('')
  // check if there are any new incidents
  const [hasNewIncident, setHasNewIncident] = useState<boolean>(false)
  const [showIncidentAlert, setShowIncidentAlert] = useState<boolean>(false)
  const [incidentAlertMessage, setIncidentAlertMessage] = useState<string>('')
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
      icon: hasGroupNotification ? (
        <Groups2Icon style={{ color: 'red' }} />
      ) : (
        <Groups2Icon />
      ),
      to: '/groups',
      onClick: () => {
        setHasGroupNotification(false)
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

  const useFlashAnimation = (bgColor: string) => {
    return useMemo(
      () => keyframes`
          0% { background-color: ${bgColor};}
          50% { background-color: black ;}
          100% { background-color: ${bgColor};}
        `,
      [bgColor],
    )
  }
  const flash = useFlashAnimation(bgColor)

  const hasIncidentTab = orderedTabs.some((tab) => tab.key === 'incidents')

  if (!hasIncidentTab && ['Dispatch', 'Police', 'Fire'].includes(role)) {
    orderedTabs.push({
      prefix: '/incidents',
      key: 'incidents',
      icon: hasNewIncident ? (
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
        setHasNewIncident(false)
        setSelectedTab('incidents')
      },
    })
  }

  if (role == 'Nurse') {
    orderedTabs.push({
      prefix: '/patients',
      key: 'patients',
      icon: <BedIcon />,
      //TODO:change the router when implementing patients page
      to: '/patients',
      onClick: () => setSelectedTab('patients'),
    })
  }

  const [maydayOpen, setMaydayOpen] = useState<boolean>(false)

  const lastTap = useRef<number | null>(null)

  const handleDoubleTapDismiss = () => {
    console.log('Double clicked')
    const now = Date.now()
    if (lastTap.current && now - lastTap.current < 300) {
      setAlertOpen((prev) => false)
      setMaydayOpen((prev) => false)
      const senderId = localStorage.getItem('uid')

      if (!senderId || !currentAlertMessageId || !currentChannelId) return

      dispatch(
        acknowledgeMessage({
          messageId: currentAlertMessageId,
          senderId,
          channelId: currentChannelId,
        }),
      )
        .unwrap()
        .then((updatedMessage) => {
          console.log('Acknowledgment updated:', updatedMessage)
        })
        .catch((error) => {
          console.error('Error acknowledging alert:', error)
        })
    }
    lastTap.current = now
  }

  useEffect(() => {
    const handleMaydayReceived = (data: any) => {
      console.log('Mayday received:', data)
      setMaydayOpen(true)
      setBgColor('red')
      setAlertMessage('MAYDAY')
    }

    const socket = SocketClient
    socket.connect()

    socket.on('connect', () => {
      console.log('Socket connected successfully')
      console.log('Current role:', role)
    })

    socket.on('new-message', (message: IMessage) => {
      dispatch(addMessage(message))
    })
    socket.on('acknowledge-alert', (updatedMessage: IMessage) => {
      dispatch(updateMessage(updatedMessage))
      setAlertOpen(false)
    })
    socket.on('new-fire-alert', (message: IMessage) => {
      console.log('new-fire-alert:', message)
      dispatch(addMessage(message))
      const [msg, bg, text] = message.content.split('-')
      setAlertMessage(msg)
      setBgColor(bg)
      setTextColor(text)
      setAlertOpen(true)
      setCurrentAlertMessageId(message._id)
      setCurrentChannelId(message.channelId)
    })
    socket.on('new-police-alert', (message: IMessage) => {
      console.log('new-police-alert:', message)
      dispatch(addMessage(message))
      const [msg, bg, text] = message.content.split('-')
      setAlertMessage(msg)
      setBgColor(bg)
      setTextColor(text)
      setAlertOpen(true)
      setCurrentAlertMessageId(message._id)
      setCurrentChannelId(message.channelId)
    })
    socket.on('send-mayday', handleMaydayReceived)
    socket.on('user-status-changed', () => {
      dispatch(loadContacts())
    })

    socket.on('group-member-added', (data) => {
      if (data.userId === localStorage.getItem('uid')) {
        setHasGroupNotification(true)
      }
    })
    socket.on('new-incident-created', (data) => {
      console.log('New incident created:', data)
      if (role === 'Dispatch') {
        setHasNewIncident(true)
        setHasNewIncident(true)
        setShowIncidentAlert(true)
        setIncidentAlertMessage(`New incident created by ${data.username}`)
        setBgColor('red')
        setTextColor('white')
      }
    })

    return () => {
      socket.off('new-message')
      socket.off('acknowledge-alert')
      socket.off('new-fire-alert')
      socket.off('new-police-alert')
      socket.off('send-mayday')
      socket.off('user-status-changed')
      socket.off('group-member-added')
      socket.off('new-incident-created')
      socket.off('map-area-update')
      socket.off('map-area-delete')
      socket.close()
    }
  }, [role, dispatch])

  return (
    <>
      {isLoggedIn ? (
        <>
          <NavigationBar showMenu={true} showBackButton={showBackButton} />
          <TabBar links={orderedTabs}></TabBar>
          {!alertOpen && <Outlet />}

          <Modal open={alertOpen}>
            <Box
              onClick={handleDoubleTapDismiss}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100%',
                animation: `${flash} 1s infinite`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h2"
                sx={{ color: textColor, fontWeight: 'bold', mb: 2 }}
              >
                {alertMessage}
              </Typography>
            </Box>
          </Modal>

          <Modal open={maydayOpen}>
            <Box
              onPointerDown={handleDoubleTapDismiss}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                animation: `${flash} 1s infinite`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
              }}
            >
              <Typography
                variant="h2"
                sx={{ color: 'black', fontWeight: 'bold', mb: 2 }}
              >
                MAYDAY
              </Typography>
            </Box>
          </Modal>
        </>
      ) : (
        <Navigate to="/login" />
      )}
      <IrSnackbar />
    </>
  )
}
