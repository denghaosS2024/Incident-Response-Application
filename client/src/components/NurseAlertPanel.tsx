import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NurseAlert } from '../models/NurseAlert'
import IPatient from '../models/Patient'
import IUser from '../models/User'
import { addMessage } from '../redux/messageSlice'
import { AppDispatch } from '../redux/store'
import { selectCurrentHospitalId } from '../redux/userHospitalSlice'
import { loadHospitalContext } from '../utils/hospitalGroupUtils'
import request from '../utils/request'

interface NurseAlertPanelProps {
  channelId?: string
  onClose?: () => void
  preSelectedPatient?: string
}

interface Patient {
  id: string
  name: string
}

const NurseAlertPanel: React.FC<NurseAlertPanelProps> = ({
  channelId = 'general', // Default to general channel if not provided
  onClose, // Optional callback function
  preSelectedPatient = '',
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] =
    useState<string>(preSelectedPatient)
  const [nursesCount, setNursesCount] = useState<number>(1)
  const [nurseUsers, setNurseUsers] = useState<IUser[]>([])
  const [totalNurses, setTotalNurses] = useState<number>(0)

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Fetch patients and nurses working at the same hospital
  const currentHospitalId = useSelector(selectCurrentHospitalId)

  // Get the hospital ID from the channel if available
  useEffect(() => {
    // Only try to load hospital context if we're in a specific channel
    if (channelId && channelId !== 'general') {
      console.log('Loading hospital context for channel:', channelId)
      // This will automatically set currentHospitalId in Redux if successful
      loadHospitalContext(channelId, dispatch)
    }
  }, [channelId, dispatch])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        let patientsList: Patient[] = []

        try {
          const patientsData = await request('/api/patients')
          console.log('Patients API response:', patientsData)

          if (
            patientsData &&
            Array.isArray(patientsData) &&
            patientsData.length > 0
          ) {
            patientsList = patientsData.map((patient: IPatient) => ({
              id: patient.patientId,
              name: patient.name || 'Unknown Patient',
            })) as Patient[]
          } else {
            // Fallback to mock data if API returns empty array
            console.log('No patients returned from API')
          }
        } catch (patientError) {
          console.error('Error fetching patients:', patientError)
        }

        setPatients(patientsList)
        console.log('Setting patients:', patientsList)

        // If we have a preSelectedPatient (ID), select it
        if (preSelectedPatient && preSelectedPatient !== selectedPatientId) {
          setSelectedPatientId(preSelectedPatient)
        }

        // Fetch nurses working at the same hospital
        // Fetch nurses working at the same hospital
        // Use the hospital ID from Redux instead of localStorage
        try {
          // Log the current hospital ID for debugging
          console.log('Current hospital ID from Redux:', currentHospitalId)

          // Fetch all nurse users first
          const users = await request(`/api/users?role=Nurse`)

          if (users && Array.isArray(users)) {
            const currentUserId = localStorage.getItem('uid')

            // Filter nurses based on role and exclude current user
            let nurseUsersFiltered = users.filter(
              (user: IUser) =>
                user._id !== currentUserId && // Exclude current user
                user.role === 'Nurse', // STRICT role check
            )

            console.log(
              'All nurses before hospital filtering:',
              nurseUsersFiltered.length,
            )

            // If we have a hospital ID, apply additional filter for hospital
            if (currentHospitalId) {
              nurseUsersFiltered = nurseUsersFiltered.filter(
                (user: IUser) => user.hospitalId === currentHospitalId,
              )
              console.log(
                `Nurses after filtering by hospital (${currentHospitalId}):`,
                nurseUsersFiltered.length,
              )
            } else {
              console.log(
                'No hospital ID available - not filtering by hospital',
              )
            }

            setNurseUsers(nurseUsersFiltered)
            // Set totalNurses to the filtered list length (ensure we have at least 1 for dropdown)
            setTotalNurses(Math.max(nurseUsersFiltered.length, 1))
          } else {
            // Fallback to empty array if no nurses found
            setNurseUsers([])
            setTotalNurses(1) // Default value for dropdown
          }
        } catch (nurseError) {
          console.error('Error fetching nurses:', nurseError)
          setNurseUsers([])
          setTotalNurses(1) // Default value for dropdown
        }
      } catch (error) {
        console.error('Error in fetchData:', error)
      }
    }

    fetchData()
  }, [preSelectedPatient, currentHospitalId])

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Helper function to get patient name from ID
  const getPatientNameById = (patientId: string): string => {
    const patient = patients.find((p) => p.id === patientId)
    return patient ? patient.name : `Patient ${patientId}`
  }

  const sendAlert = async (alertType: 'E' | 'U' | '') => {
    if (!selectedPatientId) {
      setNotification({
        open: true,
        message: 'Please select a patient',
        severity: 'error',
      })
      return
    }

    try {
      // Verify we have nurses to alert
      if (nurseUsers.length === 0) {
        setNotification({
          open: true,
          message: 'No nurses available to receive alerts',
          severity: 'error',
        })
        return
      }

      // We've already filtered to include ONLY nurses in nurseUsers, but let's be extra safe
      const availableNurses = nurseUsers.filter((user) => user.role === 'Nurse')

      // Ensure we don't request more nurses than are available
      // If nursesCount is somehow 0, default to 1 (should not happen with UI constraints)
      const actualNurseCount = Math.min(
        nursesCount || 1,
        availableNurses.length,
      )

      // Get responder IDs for only nurses
      const responderIds = availableNurses.map((user) => user._id)

      // Get patient name for display
      const patientName = getPatientNameById(selectedPatientId)

      // Create a more readable alert content format
      const alertContent = `${alertType} HELP - Patient: ${patientName} - Nurses: ${actualNurseCount} - PatientID: ${selectedPatientId}`
      const messageData = {
        content: alertContent,
        isAlert: true,
        responders: responderIds, // Include all nurses as responders
        acknowledgedBy: [],
        acknowledgeAt: [],
        alertType: alertType ? `${alertType} HELP` : 'HELP',
        patientUsername: patientName,
        patientId: selectedPatientId, // Store the ID too for reference
        nursesNeeded: actualNurseCount,
      }

      // Send the message through the API
      // If called from Messages page without a specific channel, use the nurse alerts channel
      const targetChannelId = channelId

      const message = await request(
        `/api/channels/${targetChannelId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(messageData),
        },
      )

      const alert: NurseAlert = {
        id: message._id,
        patientId: selectedPatientId,
        patientName: patientName,
        numNurse: actualNurseCount,
        priority: alertType === 'E' ? 'E' : alertType === 'U' ? 'U' : 'H',
        createdAt: new Date(),
        groupId: targetChannelId,
        senderId: localStorage.getItem('uid') ?? '',
        numNurseAccepted: 0,
      }
      const alertResult = await request(`/api/alertQueue/${targetChannelId}`, {
        method: 'POST',
        body: JSON.stringify(alert),
      })
      if (alertResult.message == 'Alert queued') {
        window.alert(
          'The alert is being delayed by other alerts and will be sent as soon as possible.',
        )
      }
      console.log('Alert Result:', alertResult)

      console.log('Alert created:', message)

      dispatch(addMessage(message))
      if (onClose) onClose()
    } catch (error) {
      console.error('Error sending alert:', error)
      setNotification({
        open: true,
        message: 'Error sending alert. Please try again.',
        severity: 'error',
      })
    }
  }

  return (
    <Box sx={{ p: 3, width: 400, maxWidth: '100%' }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="patient-select-label">Patient</InputLabel>
        <Select
          labelId="patient-select-label"
          value={selectedPatientId}
          label="Patient"
          onChange={(e) => setSelectedPatientId(e.target.value)}
          disabled={!!preSelectedPatient}
        >
          {patients.map((patient) => (
            <MenuItem key={patient.id} value={patient.id}>
              {patient.name}
            </MenuItem>
          ))}
        </Select>
        {preSelectedPatient && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Selected: {getPatientNameById(preSelectedPatient)}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="nurses-count-label">Nurses Needed</InputLabel>
        <Select
          labelId="nurses-count-label"
          value={nursesCount}
          label="Nurses Needed"
          onChange={(e) => {
            // Ensure count doesn't exceed available nurses
            const count = Number(e.target.value)
            // Make sure we don't exceed the actual number of available nurses
            const maxCount = Math.min(count, totalNurses)
            setNursesCount(maxCount)
          }}
        >
          {/* Only show options if there are nurses available */}
          {totalNurses > 0 ? (
            // Create array of options from 1 to totalNurses
            [...Array(totalNurses)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))
          ) : (
            // If no nurses available, show just one option with "0"
            <MenuItem key="no-nurses" value={0} disabled>
              No nurses available
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: 'red',
              color: 'white',
              '&:hover': {
                bgcolor: 'darkred',
              },
            }}
            onClick={() => sendAlert('E')}
          >
            E HELP
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: 'orange',
              color: 'white',
              '&:hover': {
                bgcolor: 'darkorange',
              },
            }}
            onClick={() => sendAlert('U')}
          >
            U HELP
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => sendAlert('')}
          >
            HELP
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NurseAlertPanel
