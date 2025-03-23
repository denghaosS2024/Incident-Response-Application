// External Imports
import { Box, Modal, Typography, keyframes } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import IMessage from '../models/Message'

// IR App
import IrSnackbar from '../components/common/IrSnackbar'
import ManagedTabBar from '../components/layout/ManagedTabBar'
import NavigationBar from '../components/NavigationBar'
import { loadContacts } from '../redux/contactSlice'
import {
  acknowledgeMessage,
  addMessage,
  updateMessage,
} from '../redux/messageSlice'
import { AppDispatch } from '../redux/store'
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
  // const alerts = useSelector((state: RootState) => state.messageState.alerts)
  // const hasUnreadMessages = Object.values(alerts).some((alert) => alert)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [bgColor, setBgColor] = useState('black')
  const [textColor, setTextColor] = useState('white')
  // check if there are any group notifications
  // const [hasGroupNotification, setHasGroupNotification] = useState(false)
  const [currentAlertMessageId, setCurrentAlertMessageId] = useState('')
  const [currentChannelId, setCurrentChannelId] = useState('')
  // check if there are any new incidents
  // const [hasNewIncident, setHasNewIncident] = useState<boolean>(false)
  // const [showIncidentAlert, setShowIncidentAlert] = useState<boolean>(false)
  // const [incidentAlertMessage, setIncidentAlertMessage] = useState<string>('')

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
      //TODO: Do something here?
      // if (data.userId === localStorage.getItem('uid')) {
      //   setHasGroupNotification(true)
      // }
    })
    socket.on('new-incident-created', (data) => {
      console.log('New incident created:', data)
      if (role === 'Dispatch') {
        // setHasNewIncident(true)
        // setHasNewIncident(true)
        // setShowIncidentAlert(true)
        // setIncidentAlertMessage(`New incident created by ${data.username}`)
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
          <ManagedTabBar />
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
