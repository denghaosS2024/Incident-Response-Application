import { Box, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import IMessage from '../../models/Message'
import { updateMessage } from '../../redux/messageSlice'
import { AppDispatch } from '../../redux/store'
import styles from '../../styles/ChatBox.module.css'
import request from '../../utils/request'
import SocketClient from '../../utils/Socket'
import AlertSnackbar from '../common/AlertSnackbar'
import DirectNurseAlert from '../DirectNurseAlert'
import MessageAlertOptions from '../MessageAlertOptions'
import MessageAttachmentOptions from '../MessageAttachmentOptions'
import MessageCallOptions from '../MessageCallOptions'
import MessageInput from '../MessageInput'
import MessageList from '../MessageList'
import MessageNurseAlertOptions from '../MessageNurseAlertOptions'
import VoiceRecorder from '../VoiceRecorder'

interface ChatBoxProps {
  channelId: string
  messages: IMessage[]
  currentUserId: string
  currentUserRole: string
  isLoading: boolean
  onSendMessage: (content: string, channelId: string) => Promise<void>
  isHospitalGroup?: boolean
}

const ChatBox: React.FC<ChatBoxProps> = ({
  channelId,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  onSendMessage,
  isHospitalGroup = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  // State for the snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // State for Nurse Alert display modal
  const [nurseAlertOpen, setNurseAlertOpen] = useState(false)
  const [activeAlert, setActiveAlert] = useState<IMessage | null>(null)

  // Function to handle errors from MessageCallOptions
  const handleCallError = (message: string) => {
    setSnackbarMessage(message)
    setOpenSnackbar(true)
  }

  // Function to close the snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  // Listen for new nurse alerts - using a single consolidated handler
  useEffect(() => {
    if (currentUserRole !== 'Nurse') return

    const socket = SocketClient
    socket.connect()

    // Track processed message IDs to prevent duplicates
    const processedAlertIds = new Set<string>()

    console.log(
      'Setting up nurse alert listeners for user:',
      currentUserId,
      'role:',
      currentUserRole,
    )

    // Consolidated handler for all alert types
    const handleAlert = (data: IMessage) => {
      console.log('Received alert event:', data)
      console.log('Alert content:', data.content)
      console.log('Alert isAlert flag:', data.isAlert)
      console.log('Alert responders:', data.responders)

      // Basic validations for alert messages
      if (!data || !data.content) {
        console.log('Invalid alert data, missing content')
        return
      }

      // If this is a processed alert, skip it but only if we have an ID to track
      if (data._id && processedAlertIds.has(data._id)) {
        console.log('Alert already processed, skipping duplicate:', data._id)
        return
      }

      // Check if this is a help-related message - more permissive check
      const isHelpMessage =
        (data.isAlert || data.content.includes('HELP')) &&
        (data.content.includes('Patient:') || data.content.includes('HELP'))

      console.log('Is this a help message?', isHelpMessage)

      if (!isHelpMessage) {
        console.log('Not a nurse help alert, ignoring')
        return
      }

      // Don't show alert to the sender
      if (data.sender?._id === currentUserId) {
        console.log('Current user is the sender, not showing alert')
        return
      }

      // Only show alerts to nurses - verify current user is a nurse
      if (currentUserRole !== 'Nurse') {
        console.log('Current user is not a nurse, not showing alert')
        return
      }

      // Check if message is targeted to nurses
      const hasSpecificResponders =
        Array.isArray(data.responders) && data.responders.length > 0

      // For targeting, check if the current user is included in responders
      let isTargeted = false

      if (hasSpecificResponders && data.responders) {
        isTargeted = data.responders.some((user: any) => {
          const userId = typeof user === 'object' ? user._id : user
          const userRole = typeof user === 'object' ? user.role : null

          // If we have role info, make sure it's a nurse
          if (userRole !== null) {
            return userId === currentUserId && userRole === 'Nurse'
          }

          // If no role info, just check the ID
          return userId === currentUserId
        })
      } else {
        // If no specific responders, all nurses should receive the alert
        isTargeted = true
      }

      console.log(
        'Is this nurse targeted?',
        isTargeted,
        'Has specific responders:',
        hasSpecificResponders,
      )

      // Check if not already acknowledged by this nurse
      const notAcknowledged =
        !data.acknowledgedBy ||
        !data.acknowledgedBy.some((user: any) =>
          typeof user === 'object'
            ? user._id === currentUserId
            : user === currentUserId,
        )

      if (isTargeted && notAcknowledged) {
        console.log('Setting active alert and opening alert modal')
        // Mark this alert as processed
        if (data._id) {
          processedAlertIds.add(data._id)
        }
        setActiveAlert(data)
        setNurseAlertOpen(true)
      } else {
        console.log(
          'Not showing alert. Already acknowledged:',
          !notAcknowledged,
          'or not targeted:',
          !isTargeted,
        )
      }
    }

    // Debug listener for all events
    const debugSocketEvents = (data: any) => {
      console.log('Socket event received:', data)
    }

    // Only use one handler for nurse alerts, but listen on multiple channels
    socket.on('nurse-alert', handleAlert)
    socket.on('message', handleAlert)
    socket.on('new-message', handleAlert)

    // Add debug listeners for any potentially relevant events
    socket.on('alert', debugSocketEvents)
    socket.on('help', debugSocketEvents)
    socket.on('notification', debugSocketEvents)

    return () => {
      socket.off('nurse-alert')
      socket.off('message')
      socket.off('new-message')
      socket.off('alert')
      socket.off('help')
      socket.off('notification')
    }
  }, [currentUserId, currentUserRole])

  // Handle nurse alert acknowledgments
  const handleAlertAccept = async () => {
    if (!activeAlert) return

    try {
      console.log('Accepting alert:', activeAlert._id)
      const response = await request(
        `/api/channels/${activeAlert.channelId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: activeAlert._id,
            response: 'ACCEPT',
          }),
        },
      )

      dispatch(updateMessage(response))
      setNurseAlertOpen(false)
      setActiveAlert(null)
    } catch (error) {
      console.error('Error acknowledging message:', error)
    }
  }

  const handleAlertBusy = async () => {
    if (!activeAlert) return

    try {
      console.log('Marking busy for alert:', activeAlert._id)
      const response = await request(
        `/api/channels/${activeAlert.channelId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: activeAlert._id,
            response: 'BUSY',
          }),
        },
      )

      dispatch(updateMessage(response))
      setNurseAlertOpen(false)
      setActiveAlert(null)
    } catch (error) {
      console.error('Error acknowledging message:', error)
    }
  }

  // Get current patient from URL query params if in patient visit screen
  const getPatientFromUrl = (): string | undefined => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const patient = urlParams.get('patient')
      if (patient) {
        return patient
      }
    }
    return undefined
  }

  const preSelectedPatient = getPatientFromUrl()

  // Development testing code has been removed

  // Determine alert type from message content
  const getAlertType = (content: string): 'E' | 'U' | '' => {
    if (content.includes('E HELP')) return 'E'
    if (content.includes('U HELP')) return 'U'
    // For regular HELP, ensure it's not an E or U help
    if (
      content.includes('HELP') &&
      !content.includes('E HELP') &&
      !content.includes('U HELP')
    )
      return ''
    return ''
  }

  // Get patient name from alert message
  const getPatientName = (content: string): string => {
    // Extract patient name from the new format: 'HELP - Patient: PatientName - Nurses: X'
    const patientMatch = content.match(/Patient:\s*([^-]+)/)
    return patientMatch && patientMatch[1]
      ? patientMatch[1].trim()
      : 'Unknown Patient'
  }

  return (
    <Grid className={styles.root} container direction="column">
      <Grid className={styles.list} item>
        <MessageList messages={messages || []} loading={isLoading} />
      </Grid>

      <Grid className={styles.input} item>
        <Box display="flex" flexDirection="column">
          {/* All the buttons */}
          <Box
            display="flex"
            alignItems="center"
            // columnGap controls spacing between each button
            sx={{ columnGap: 1 }}
          >
            <MessageAttachmentOptions
              channelId={channelId}
              currentUserId={currentUserId}
            />
            <MessageCallOptions
              channelId={channelId}
              currentUserId={currentUserId}
              onError={handleCallError}
            />
            <VoiceRecorder channelId={channelId} />
            {['Fire', 'Police'].includes(currentUserRole) && (
              <MessageAlertOptions
                channelId={channelId}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            )}
            {currentUserRole === 'Nurse' && isHospitalGroup && (
              <MessageNurseAlertOptions
                channelId={channelId}
                currentUserId={currentUserId}
                preSelectedPatient={preSelectedPatient}
              />
            )}
          </Box>

          {/* Input box  */}
          <Box display="flex" alignItems="center">
            <Box flexGrow={1}>
              <MessageInput
                onSubmit={(content: string) =>
                  onSendMessage(content, channelId)
                }
              />
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Snackbar for errors */}
      <AlertSnackbar
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity="error"
      />

      {/* Nurse Alert Display */}
      {activeAlert && nurseAlertOpen && (
        <DirectNurseAlert
          alertType={getAlertType(activeAlert.content)}
          patientName={getPatientName(activeAlert.content)}
          onAccept={handleAlertAccept}
          onBusy={handleAlertBusy}
        />
      )}
    </Grid>
  )
}

export default ChatBox
