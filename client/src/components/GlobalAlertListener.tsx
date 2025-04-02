import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { updateMessage } from '../redux/messageSlice'
import request from '../utils/request'
import SocketClient from '../utils/Socket'
import DirectNurseAlert from './DirectNurseAlert'

/**
 * Global component to listen for alerts and manage the alert queue
 * This component should be mounted at the top level of the app so it's always active
 */
const GlobalAlertListener: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUserId = localStorage.getItem('uid')
  const currentUserRole = localStorage.getItem('role')
  
  // State for the current alert
  const [currentAlert, setCurrentAlert] = useState<any>(null)
  const [isFlashing, setIsFlashing] = useState(true)

  // Create flashing effect when alert is active
  useEffect(() => {
    if (!currentAlert) return;
    
    const flashInterval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 500)

    return () => clearInterval(flashInterval)
  }, [currentAlert])

  // Listen for incoming nurse alerts
  useEffect(() => {
    if (currentUserRole !== 'Nurse') return;

    const socket = SocketClient;
    socket.connect();

    const handleIncomingAlert = (alert: any) => {
      console.log('GlobalAlertListener: Received incoming-nurse-alert:', alert);
      
      // Don't show alert to the sender
      if (alert.senderId === currentUserId) {
        console.log('GlobalAlertListener: Current user is the sender, not showing alert');
        return;
      }

      // Parse alert content
      // const content = alert.content || '';
      const alertType = alert.priority;
      
      // Extract patient name
      const patientName = alert.patientName;

      setCurrentAlert({
        ...alert,
        alertType,
        patientName
      });
    };

    socket.on('incoming-nurse-alert', handleIncomingAlert);

    return () => {
      socket.off('incoming-nurse-alert');
    };
  }, [currentUserId, currentUserRole]);

  // Handle alert acceptance
  const handleAlertAccept = async () => {
    if (!currentAlert) return;

    try {
      console.log('GlobalAlertListener: Accepting alert:', currentAlert);
      const response = await request(
        `/api/channels/${currentAlert.groupId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: currentAlert.id,
            response: 'ACCEPT',
          }),
        }
      );

      dispatch(updateMessage(response));
      
      // Navigate to the hospital group chat when alert is accepted
      // Use the group ID from the alert to navigate to the corresponding channel
      if (currentAlert.groupId) {
        console.log('GlobalAlertListener: Navigating to group chat:', currentAlert.groupId);
        navigate(`/messages?channelId=${currentAlert.groupId}`);
      }
      
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Handle alert busy
  const handleAlertBusy = async () => {
    if (!currentAlert) return;

    try {
      const response = await request(
        `/api/channels/${currentAlert.groupId}/messages/acknowledge`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            messageId: currentAlert.id,
            response: 'BUSY',
          }),
        }
      );

      dispatch(updateMessage(response));
      setCurrentAlert(null);
    } catch (error) {
      console.error('Error marking alert as busy:', error);
    }
  };

  // Handle alert expiration
  const handleAlertExpired = () => {
    setCurrentAlert(null);
  };

  // Render DirectNurseAlert if there's an active alert
  if (!currentAlert) return null;

  return (
    <DirectNurseAlert
      alertType={currentAlert.alertType}
      patientName={currentAlert.patientName}
      onAccept={handleAlertAccept}
      onBusy={handleAlertBusy}
      onTimeExpired={handleAlertExpired}
    />
  );
};

// // Determine alert type from message content
// const getAlertType = (content: string): 'E' | 'U' | '' => {
//   if (content.includes('E HELP')) return 'E'
//   if (content.includes('U HELP')) return 'U'
//   if (content.includes('HELP') && !content.includes('E HELP') && !content.includes('U HELP')) return ''
//   return ''
// }

// // Get patient name from alert message
// const getPatientName = (content: string): string => {
//   const patientMatch = content.match(/Patient:\s*([^-]+)/)
//   return patientMatch && patientMatch[1] ? patientMatch[1].trim() : 'Unknown Patient'
// }

export default GlobalAlertListener 