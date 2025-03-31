import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addAlert, completeActiveAlert } from '../redux/alertQueueSlice'
import { updateMessage } from '../redux/messageSlice'
import { RootState } from '../redux/store'
import request from '../utils/request'
import SocketClient from '../utils/Socket'
import DirectNurseAlert from './DirectNurseAlert'

/**
 * Global component to listen for alerts and manage the alert queue
 * This component should be mounted at the top level of the app so it's always active
 */
const GlobalAlertListener: React.FC = () => {
  const dispatch = useDispatch()
  const currentUserId = localStorage.getItem('uid')
  const currentUserRole = localStorage.getItem('role')
  
  // State for flashing effect
  const [isFlashing, setIsFlashing] = useState(true)
  const [lastActiveAlertId, setLastActiveAlertId] = useState<string | null>(null)

  // Look for active nurse alerts in any channel that this nurse should respond to
  const activeAlert = useSelector((state: RootState) => {
    // Skip if user is not a nurse
    if (currentUserRole !== 'Nurse') return null;
    
    // Check all channels for active alerts
    for (const channelId in state.alertQueue.activeAlerts) {
      const alert = state.alertQueue.activeAlerts[channelId];
      if (!alert) continue;
      
      const content = alert.content || "";
      // Check if this is a HELP message for nurses
      if (content.includes("HELP") && (content.includes("Patient:") || content.includes("Nurse"))) {
        // Check if targeted to this nurse using responders array
        const responders = alert.responders || [];
        // If no responders specified, show to all nurses
        if (responders.length === 0) {
          console.log("GlobalAlertListener: Found nurse alert targeted to all nurses in channel:", channelId);
          return alert;
        }
        
        // Check if this nurse is in the responders
        const isTargeted = responders.some((user: any) => {
          const userId = typeof user === 'object' ? user._id : user;
          return userId === currentUserId;
        });
        
        if (isTargeted) {
          console.log("GlobalAlertListener: Found nurse alert targeted to this nurse in channel:", channelId);
          return alert;
        }
      }
    }
    
    return null;
  });

  // Handle timer expiration - simply remove the alert from the queue
  const handleAlertExpired = () => {
    if (!activeAlert) return;
    
    console.log('GlobalAlertListener: Alert expired, removing from queue without sending response:', activeAlert._id);
    // Simply remove the alert from the queue without sending a response to the server
    dispatch(completeActiveAlert({ 
      channelId: activeAlert.channelId || 'nurse-alerts', 
      alertId: activeAlert._id
    }));
  };

  // Track when alerts change
  useEffect(() => {
    if (activeAlert && activeAlert._id !== lastActiveAlertId) {
      console.log('GlobalAlertListener: New active alert detected:', activeAlert._id, 'in channel:', activeAlert.channelId);
      setLastActiveAlertId(activeAlert._id);
    }
  }, [activeAlert, lastActiveAlertId]);

  // Create flashing effect when alert is active
  useEffect(() => {
    if (!activeAlert) return;
    
    console.log('Setting up flashing effect for nurse alert')
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 500)

    return () => clearInterval(flashInterval)
  }, [activeAlert])

  // Listen for new nurse alerts - using a consolidated handler
  useEffect(() => {
    if (currentUserRole !== 'Nurse') return

    const socket = SocketClient
    socket.connect()

    console.log(
      'GlobalAlertListener: Setting up nurse alert listeners for user:',
      currentUserId,
      'role:',
      currentUserRole,
    )

    // Consolidated handler for all alert types
    const handleAlert = (data: any) => {
      console.log('GlobalAlertListener: Received alert event:', data)

      // Basic validations for alert messages
      if (!data || !data.content) {
        console.log('GlobalAlertListener: Invalid alert data, missing content')
        return
      }

      // Check if this is a help-related message
      const isHelpMessage =
        (data.isAlert || data.content.includes('HELP')) &&
        (data.content.includes('Patient:') || data.content.includes('HELP'))

      console.log('GlobalAlertListener: Is this a help message?', isHelpMessage)

      if (!isHelpMessage) {
        console.log('GlobalAlertListener: Not a nurse help alert, ignoring')
        return
      }

      // Don't show alert to the sender
      if (data.sender?._id === currentUserId) {
        console.log('GlobalAlertListener: Current user is the sender, not showing alert')
        return
      }

      // Only show alerts to nurses - verify current user is a nurse
      if (currentUserRole !== 'Nurse') {
        console.log('GlobalAlertListener: Current user is not a nurse, not showing alert')
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
        'GlobalAlertListener: Is this nurse targeted?',
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
        console.log('GlobalAlertListener: Adding alert to queue')
        // If the channelId is missing, use the nurse-alerts channel
        if (!data.channelId) {
          data.channelId = 'nurse-alerts'
        }
        // Add to Redux queue
        dispatch(addAlert(data))
      } else {
        console.log(
          'GlobalAlertListener: Not showing alert. Already acknowledged:',
          !notAcknowledged,
          'or not targeted:',
          !isTargeted,
        )
      }
    }

    // Only use one handler for nurse alerts
    socket.on('nurse-alert', handleAlert)

    return () => {
      socket.off('nurse-alert')
    }
  }, [currentUserId, currentUserRole, dispatch])

  // Handle nurse alert acknowledgments
  const handleAlertAccept = async () => {
    if (!activeAlert) {
      console.log('GlobalAlertListener: No active alert to accept')
      return
    }

    try {
      console.log('GlobalAlertListener: Accepting alert:', activeAlert._id)
      // Store the alert ID and channelId before making the API call
      const alertId = activeAlert._id
      const alertChannelId = activeAlert.channelId
      
      if (!alertChannelId) {
        console.error('GlobalAlertListener: No channelId for alert, cannot acknowledge');
        return;
      }

      // Make API call
      console.log('GlobalAlertListener: Making API call to acknowledge alert for channel:', alertChannelId)
      const response = await request(
        `/api/channels/${alertChannelId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: alertId,
            response: 'ACCEPT',
          }),
        }
      )

      // Update message state
      console.log('GlobalAlertListener: API call successful, updating message state')
      dispatch(updateMessage(response))
      
      // Complete the alert in Redux
      console.log('GlobalAlertListener: Completing alert in Redux')
      dispatch(completeActiveAlert({ 
        channelId: alertChannelId, 
        alertId: alertId
      }))
    } catch (error) {
      console.error('GlobalAlertListener: Error acknowledging message:', error)
    }
  }

  const handleAlertBusy = async () => {
    if (!activeAlert) {
      console.log('GlobalAlertListener: No active alert to mark as busy')
      return
    }

    try {
      console.log('GlobalAlertListener: Marking busy for alert:', activeAlert._id)
      // Store the alert ID and channelId before making the API call
      const alertId = activeAlert._id
      const alertChannelId = activeAlert.channelId
      
      if (!alertChannelId) {
        console.error('GlobalAlertListener: No channelId for alert, cannot acknowledge');
        return;
      }

      // Make API call
      console.log('GlobalAlertListener: Making API call to mark alert as busy')
      const response = await request(
        `/api/channels/${alertChannelId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: alertId,
            response: 'BUSY',
          }),
        }
      )

      // Update message state
      console.log('GlobalAlertListener: API call successful, updating message state')
      dispatch(updateMessage(response))
      
      // Complete the alert in Redux
      console.log('GlobalAlertListener: Completing alert in Redux')
      dispatch(completeActiveAlert({ 
        channelId: alertChannelId, 
        alertId: alertId
      }))
    } catch (error) {
      console.error('GlobalAlertListener: Error acknowledging message:', error)
    }
  }

  // Check if we should show alerts - only render if there's an active alert and user is a nurse
  if (!activeAlert || currentUserRole !== 'Nurse') {
    return null;
  }

  console.log('GlobalAlertListener: Rendering active alert!', activeAlert._id, isFlashing);

  // Standard rendering
  return (
    <DirectNurseAlert
      alertType={getAlertType(activeAlert.content)}
      patientName={getPatientName(activeAlert.content)}
      onAccept={handleAlertAccept}
      onBusy={handleAlertBusy}
      onTimeExpired={handleAlertExpired}
    />
  )
}

// Determine alert type from message content
const getAlertType = (content: string): 'E' | 'U' | '' => {
  if (content.includes('E HELP')) return 'E'
  if (content.includes('U HELP')) return 'U'
  if (content.includes('HELP') && !content.includes('E HELP') && !content.includes('U HELP')) return ''
  return ''
}

// Get patient name from alert message
const getPatientName = (content: string): string => {
  const patientMatch = content.match(/Patient:\s*([^-]+)/)
  return patientMatch && patientMatch[1] ? patientMatch[1].trim() : 'Unknown Patient'
}

export default GlobalAlertListener 