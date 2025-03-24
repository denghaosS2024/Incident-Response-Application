import IHospital from '@/models/Hospital'
import eventEmitter from '@/utils/eventEmitter'
import request from '@/utils/request'
import { Map as MapIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
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
      <Typography variant="h5" gutterBottom>
        Find Hospital
      </Typography>

      <Box marginY={2}>
        <Typography variant="body1" gutterBottom>
          Find the nearest hospital with available ER beds for your patients.
        </Typography>
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

      <Box marginTop={3}>
        <Typography variant="h6" gutterBottom>
          Available Hospitals ({hospitals.length})
        </Typography>
        {hospitals.length > 0 ? (
          <Box>
            {hospitals.map((hospital) => (
              <Box
                key={hospital.hospitalId}
                border={1}
                borderColor="divider"
                borderRadius={1}
                padding={2}
                marginBottom={1}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {hospital.hospitalName}
                </Typography>
                <Typography variant="body2">
                  {hospital.hospitalAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total ER Beds: {hospital.totalNumberERBeds || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available:{' '}
                  {(hospital.totalNumberERBeds || 0) -
                    (hospital.totalNumberOfPatients || 0)}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No hospitals found. Please register hospitals first.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default FindHospital
