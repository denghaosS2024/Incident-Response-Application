import IHospital from '@/models/Hospital'
import request from '@/utils/request'
import { Add, NavigateNext as Arrow } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GenericListContainer from '../components/GenericListContainer'

const HospitalsDirectory: React.FC = () => {
  const [hospitalList, setHospitalList] = useState<IHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch hospitals from the server
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setError(null)
      try {
        const data = await request('/api/hospital')
        setHospitalList(data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch hospitals'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle redirection to the register hospital page
  const redirectToRegisterHospital = () => {
    navigate('/register-hospital')
  }

  // Handle redirection to the register hospital page to access description
  const redirectToHospitalDescription = (hospital: IHospital) => {
    navigate(`/register-hospital/${hospital.hospitalId}`)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Box sx={{ padding: 2 }}>
      <Box className="flex justify-between items-center w-full mb-2">
        <Typography variant="h6">Hospitals</Typography>
      </Box>

      <GenericListContainer<IHospital>
        key="hospitals"
        header="Hospitals"
        listProps={{
          items: hospitalList,
          loading: false,
          getKey: (hospital: IHospital): string => hospital.hospitalId,
          renderItem: (hospital: IHospital) => (
            <Box className="flex items-center justify-between gap-2 p-1">
              <Box className="grid grid-cols-[2fr_1fr_1fr] gap-2 items-center flex-grow">
                <Typography variant="body2" className="text-left">
                  {hospital.hospitalName}
                </Typography>
                <Typography variant="body2" className="text-center">
                  {hospital.totalNumberERBeds}
                </Typography>
                <Typography variant="body2" className="text-center">
                  {0}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                size="large"
                onClick={(): void => redirectToHospitalDescription(hospital)}
              >
                <Arrow />
              </IconButton>
            </Box>
          ),
        }}
      />
      <IconButton
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 56,
          height: 56,
        }}
        onClick={redirectToRegisterHospital}
      >
        <Add fontSize="large" />
      </IconButton>
    </Box>
  )
}

export default HospitalsDirectory
