// External Imports
import { Box, Modal, Typography, keyframes } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import IMessage from '../models/Message'

// IR App
import {
  setHasGroupNotification,
  setHasNewIncident,
  setIncidentAlertMessage,
  setShowIncidentAlert,
} from '@/redux/notifySlice'
import IrSnackbar from '../components/common/IrSnackbar'
import DirectNurseAlert from '../components/DirectNurseAlert'
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

  // Nurse alert state
  const [nurseAlertVisible, setNurseAlertVisible] = useState(false)
  const [nurseAlertData, setNurseAlertData] = useState<{
    alertType: 'E' | 'U' | ''
    patientName: string
    messageId: string
    channelId: string
  }>({ alertType: '', patientName: '', messageId: '', channelId: '' })

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
      clearAlertTimeout();
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

  // Handle nurse alert accept
  const handleNurseAlertAccept = async () => {
    console.log('Nurse alert accepted')
    try {
      const senderId = localStorage.getItem('uid')
      if (!senderId || !nurseAlertData.messageId || !nurseAlertData.channelId)
        return

      await dispatch(
        acknowledgeMessage({
          messageId: nurseAlertData.messageId,
          senderId,
          channelId: nurseAlertData.channelId,
          response: 'ACCEPT',
        }),
      ).unwrap()

      setNurseAlertVisible(false)
      clearAlertTimeout();
    } catch (error) {
      console.error('Error accepting nurse alert:', error)
    }
  }

  // Handle nurse alert busy
  const handleNurseAlertBusy = async () => {
    console.log('Nurse alert marked as busy')
    try {
      const senderId = localStorage.getItem('uid')
      if (!senderId || !nurseAlertData.messageId || !nurseAlertData.channelId)
        return

      await dispatch(
        acknowledgeMessage({
          messageId: nurseAlertData.messageId,
          senderId,
          channelId: nurseAlertData.channelId,
          response: 'BUSY',
        }),
      ).unwrap()

      setNurseAlertVisible(false)
      clearAlertTimeout();
    } catch (error) {
      console.error('Error marking nurse alert as busy:', error)
    }
  }

  // Timer ref to track and clean up alert timeouts
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to clear any existing alert timeout
  const clearAlertTimeout = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
  };

  // Function to set up a timeout to automatically dismiss alerts after 2 minutes
  const setupAlertTimeout = () => {
    clearAlertTimeout(); // Clear any existing timeout
    
    // Set up a new timeout - 2 minutes = 120000 ms
    alertTimeoutRef.current = setTimeout(() => {
      console.log('Alert timeout reached (2 minutes) - automatically dismissing');
      setAlertOpen(false);
      setMaydayOpen(false);
      setNurseAlertVisible(false);
    }, 120000);
  };

  useEffect(() => {
    const handleMaydayReceived = (data: any) => {
      console.log('Mayday received:', data)
      setMaydayOpen(true)
      setBgColor('red')
      setAlertMessage('MAYDAY')
      setupAlertTimeout();
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
      setupAlertTimeout();
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
      setupAlertTimeout();
    })
    socket.on('nurse-alert', (message: IMessage) => {
      console.log('[DEBUG] Received nurse-alert:', message)
      dispatch(addMessage(message))

      // Only show the alert for nurses that are in the responders list
      const currentUserId = localStorage.getItem('uid')
      const isResponder = message.responders?.some(
        (responder) =>
          responder._id === currentUserId ||
          (typeof responder === 'string' && responder === currentUserId),
      )

      console.log('[DEBUG] Nurse alert checks:', {
        currentUserId,
        role,
        isNurse: role === 'Nurse',
        isResponder,
        responders: message.responders,
        content: message.content,
      })

      if (isResponder && role === 'Nurse') {
        // Parse the alert content to get the type and patient name
        const content = message.content || ''
        let alertType: 'E' | 'U' | '' = ''
        let patientName = ''
        
        // Support both new format "E HELP - Patient: PatientName - Nurses: X"
        // and old format "E HELP-PatientName"
        const patientMatch = content.match(/Patient:\s*([^-]+)/)
        
        if (content.startsWith('E HELP')) {
          alertType = 'E'
          if (patientMatch && patientMatch[1]) {
            patientName = patientMatch[1].trim()
          } else if (content.includes('-')) {
            // Fallback to old format
            patientName = content.split('-')[1] || ''
          }
        } else if (content.startsWith('U HELP')) {
          alertType = 'U'
          if (patientMatch && patientMatch[1]) {
            patientName = patientMatch[1].trim()
          } else if (content.includes('-')) {
            // Fallback to old format
            patientName = content.split('-')[1] || ''
          }
        } else if (content.includes(' HELP')) {
          alertType = ''
          patientName = content.split('-')[1] || ''
        }

        console.log('[DEBUG] Setting nurse alert with:', {
          alertType,
          patientName,
          messageId: message._id,
        })

        // Update state with alert data
        setNurseAlertData({
          alertType,
          patientName,
          messageId: message._id,
          channelId: message.channelId,
        })

        // Show the alert
        console.log('[DEBUG] Setting nurse alert visible to true')
        setNurseAlertVisible(true)
        setupAlertTimeout()
      }
    })
    socket.on('send-mayday', handleMaydayReceived)
    socket.on('user-status-changed', () => {
      dispatch(loadContacts())
    })

    socket.on('group-member-added', (data) => {
      //TODO: Do something here?
      if (data.userId === localStorage.getItem('uid')) {
        dispatch(setHasGroupNotification(true))
      }
    })
    socket.on('new-incident-created', (data) => {
      console.log('New incident created:', data)
      if (role === 'Dispatch') {
        dispatch(setHasNewIncident(true))
        dispatch(setShowIncidentAlert(true))
        dispatch(
          setIncidentAlertMessage(`New incident created by ${data.username}`),
        )
        setBgColor('red')
        setTextColor('white')
      }
    })

    return () => {
      socket.off('new-message')
      socket.off('acknowledge-alert')
      socket.off('new-fire-alert')
      socket.off('new-police-alert')
      socket.off('nurse-alert')
      socket.off('send-mayday')
      socket.off('user-status-changed')
      socket.off('group-member-added')
      socket.off('new-incident-created')
      socket.off('map-area-update')
      socket.off('map-area-delete')
      socket.close()
      
      // Clear any active timeout when unmounting
      clearAlertTimeout();
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

          {nurseAlertVisible && (
            <DirectNurseAlert
              alertType={nurseAlertData.alertType}
              patientName={nurseAlertData.patientName}
              onAccept={handleNurseAlertAccept}
              onBusy={handleNurseAlertBusy}
            />
          )}
        </>
      ) : (
        <Navigate to="/login" />
      )}
      <IrSnackbar />
    </>
  )
}
