import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type IIncident from '../../models/Incident'
import { IncidentPriority } from '../../models/Incident'
import { updateIncident } from '../../redux/incidentSlice'
import type { AppDispatch } from '../../redux/store'
import request from '../../utils/request'

interface Reach911Step5Props {
  incidentId?: string
}

const Reach911Step5: React.FC<Reach911Step5Props> = ({ incidentId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [incidentData, setIncidentData] = useState<IIncident | null>(null)
  const [priority, setPriority] = useState<string>('E')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  // Two-way mapping between UI and backend values for priority.
  const displayToBackend: Record<string, IncidentPriority> = {
    E: IncidentPriority.Immediate,
    '1': IncidentPriority.Urgent,
    '2': IncidentPriority.CouldWait,
    '3': IncidentPriority.Dismiss,
  }

  const backendToDisplay: Record<IncidentPriority, string> = {
    [IncidentPriority.Immediate]: 'E',
    [IncidentPriority.Urgent]: '1',
    [IncidentPriority.CouldWait]: '2',
    [IncidentPriority.Dismiss]: '3',
    [IncidentPriority.Unset]: 'E',
  }

  // Fetch incident details and update Redux state
  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        if (!incidentId) throw new Error('No incidentId provided')
        const data = await request(`/api/incidents?incidentId=${incidentId}`)
        if (Array.isArray(data) && data.length > 0) {
          const incident = data[0]
          setIncidentData(incident)
          dispatch(updateIncident(incident))
          if (incident.priority) {
            const uiPriority =
              backendToDisplay[incident.priority as IncidentPriority] || 'E'
            setPriority(uiPriority)
          }
        } else {
          setError('No incident found for this incidentId')
        }
      } catch (err: any) {
        console.error('Error fetching incident details:', err)
        setError('Failed to load incident details')
      } finally {
        setLoading(false)
      }
    }
    fetchIncidentDetails()
  }, [incidentId, dispatch])

  // Function to handle priority change and save immediately
  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority) // Update UI state immediately
    if (!incidentData) return
    try {
      setLoading(true)
      setError(null)
      const convertedPriority =
        displayToBackend[newPriority] || IncidentPriority.Immediate
      const updatedIncident = {
        incidentId: incidentData.incidentId,
        priority: convertedPriority,
        commander: incidentData.commander,
      }

      let updateResponse
      try {
        updateResponse = await request('/api/incidents/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedIncident),
        })
      } catch (e: any) {
        if (e.message && e.message.includes('Unexpected end of JSON input')) {
          updateResponse = { status: 204 }
        } else {
          throw e
        }
      }

      if (updateResponse.status !== 204) {
        throw new Error('Failed to update incident')
      }

      dispatch(
        updateIncident({
          ...incidentData,
          priority: convertedPriority,
          commander: incidentData.commander,
        }),
      )
      // alert("Incident updated successfully!");
    } catch (err) {
      console.error('Error updating incident:', err)
      setError('Failed to update incident')
    } finally {
      setLoading(false)
    }
  }

  // Navigation handler to resources page
  const handleNavigateToResources = () => {
    navigate(`/resources`)
  }

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Paper>
    )
  }

  if (!incidentData) {
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <Typography>No incident data available</Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 2, m: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Response Team Corner
        </Typography>
        <Typography>Incident Open: {incidentData.openingDate}</Typography>
        <Typography>Incident ID: {incidentData.incidentId}</Typography>
        <Typography>
          Incident Caller: {incidentData.caller || 'None'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Incident Priority
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => handlePriorityChange(e.target.value as string)}
          >
            <MenuItem value="E">E</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Who is on the Team?
        </Typography>
        <Typography>Owner: {incidentData.owner}</Typography>
        <Typography>Commander: {incidentData.commander}</Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToResources}
      >
        {' '}
        Allocate Resources
      </Button>
    </Paper>
  )
}

export default Reach911Step5
