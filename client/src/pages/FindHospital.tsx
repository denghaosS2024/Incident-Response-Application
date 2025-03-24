import HospitalCard from '@/components/FindHospital/HospitalCard'
import IHospital from '@/models/Hospital'
import eventEmitter from '@/utils/eventEmitter'
import request from '@/utils/request'
import { Map as MapIcon } from '@mui/icons-material'
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FindHospital: React.FC = () => {
  const [hospitals, setHospitals] = useState<IHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await request('/api/hospital')
        setHospitals(data)
        setLoading(false)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch hospitals'
        setError(errorMessage)
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  // Navigate to map and activate hospital layer
  const redirectToMapWithHospitals = () => {
    // Navigate to the map page
    navigate('/map')

    // Emit event to activate the hospital layer after a small delay to ensure
    // the map component is loaded and event listeners are attached
    setTimeout(() => {
      eventEmitter.emit('selectUtil', { layer: 'Util', visible: true })
      eventEmitter.emit('selectUtil', { layer: 'Hospitals', visible: true })
    }, 500)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box padding={2}>
      <Box marginY={2}>
        <Typography variant="body1" gutterBottom>
          Drag and drop patients:
        </Typography>
      </Box>

      <Box className="flex flex-row justify-between">
        <Box className="w-1/3">
          <Typography>Patients</Typography>
          
        </Box>
        <Box className="w-2/3">
          {hospitals.length > 0 ? (
            <Box>
              {hospitals.map((hospital, id) => (
                <HospitalCard
                  key={'hospital-' + id}
                  hospital={hospital}
                ></HospitalCard>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No hospitals found. Please register hospitals first.
            </Typography>
          )}
        </Box>
      </Box>

      <Box display="flex" justifyContent="center" marginY={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MapIcon />}
          onClick={redirectToMapWithHospitals}
          size="large"
        >
          See Hospitals on Map
        </Button>
      </Box>
    </Box>
  )
}

export default FindHospital
