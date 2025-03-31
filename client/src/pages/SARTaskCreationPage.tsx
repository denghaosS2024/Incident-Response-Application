import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import Map from '../components/Map/Mapbox'
import styles from '../styles/Reach911Page.module.css'
import { AddressAutofill } from '@mapbox/search-js-react'
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core'
import Globals from '../utils/Globals'
import LocationOnIcon from '@mui/icons-material/LocationOn'

interface SARTask {
  id?: string
  name: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  location?: {
    latitude: number
    longitude: number
  }
  address?: string
  assignedTeam?: string
  priority: 'high' | 'medium' | 'low'
  createdAt?: string
  updatedAt?: string
}

const SARTaskCreationPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>()
  const navigate = useNavigate()
  const incident = useSelector((state: RootState) => state.incidentState.incident)
  
  useEffect(() => {
    console.log('Task creation for incident:', incidentId)
  }, [incidentId])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState<SARTask>({
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    address: '',
  })
  const [inputAddress, setInputAddress] = useState('')

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTask({
      ...task,
      [name]: value,
    })
  }

  // Handle select input changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target
    setTask({
      ...task,
      [name]: value,
    })
  }

  // Handle address input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target
    setInputAddress(value)
  }

  // Handle address selection from autofill
  const onRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const newAddress = res.features[0].properties.full_address ?? ''
    const newLocation = {
      longitude: res.features[0].geometry.coordinates[0],
      latitude: res.features[0].geometry.coordinates[1],
    }
    setTask({
      ...task,
      location: newLocation,
      address: newAddress,
    })
    setInputAddress(newAddress)
  }

  // When user clicks out of the input, revert to task address
  const onBlur = () => {
    setInputAddress(task.address || '')
  }

  // Create new task
  const handleCreateTask = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // This is a placeholder for future implementation
      // In a real implementation, we would save the task to the database
      console.log('Creating new SAR task:', task)
      
      // Navigate back to the SAR incident page
      navigate(`/sar-incident`)
    } catch (err: any) {
      console.error('Error creating task:', err)
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create New SAR Task
        </Typography>
        
        {incident.incidentId && (
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              py: 1,
              px: 2,
              borderRadius: 1,
              display: 'inline-block',
              mx: 'auto'
            }}
          >
            SAR Incident ID: {incident.incidentId}
          </Typography>
        )}

        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Task Name"
            name="name"
            value={task.name}
            onChange={handleTextChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={task.description}
            onChange={handleTextChange}
            margin="normal"
            multiline
            rows={4}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={task.priority}
                label="Priority"
                onChange={handleSelectChange}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={task.status}
                label="Status"
                onChange={handleSelectChange}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Task Location
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <AddressAutofill
              onRetrieve={onRetrieve}
              options={{ streets: false }}
              accessToken={Globals.getMapboxToken()}
            >
              <TextField
                fullWidth
                label="Task Location"
                variant="outlined"
                value={inputAddress}
                autoComplete="street-address"
                onBlur={onBlur}
                onChange={handleAddressChange}
              />
            </AddressAutofill>
          </Box>
          
          <Box
            sx={{
              width: '100%',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              mt: 2,
              mb: 3,
              position: 'relative',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <LocationOnIcon color="error" />
              <Typography variant="body2" align="center">
                Drag the marker to set the exact task location
              </Typography>
            </Box>
            <div
              className={styles.flexCenter}
              style={{
                height: '100%',
                width: '100%',
                position: 'relative',
                minHeight: '400px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  margin: 0,
                  padding: 0,
                }}
              >
                <Map
                  showMarker={true}
                  disableGeolocation={false}
                />
              </div>
            </div>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/sar-incident`)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateTask}
              disabled={loading || !task.name}
            >
              Create Task
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default SARTaskCreationPage
