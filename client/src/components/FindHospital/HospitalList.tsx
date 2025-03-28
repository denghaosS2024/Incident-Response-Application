import IHospital from '@/models/Hospital'
import { fetchHospitals } from '@/redux/hospitalSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HospitalCard from './HospitalCard'

const HospitalList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const hospitals: IHospital[] = useSelector(
    (state: RootState) => state.hospital.hospitals,
  )


  
  useEffect(() => {
    dispatch(fetchHospitals())
  }, [dispatch])

  const loading: boolean = useSelector(
    (state: RootState) => state.hospital.loading,
  )

  const error: string | null = useSelector(
    (state: RootState) => state.hospital.error,
  )

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
    <Box className="w-2/3">
      {hospitals.length > 0 ? (
        hospitals.map((hospital, id) => (
          <HospitalCard
            key={'hospital-' + id}
            id={'hospital-' + id}
            hospital={hospital}
          />
        ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          No hospitals found. Please register hospitals first.
        </Typography>
      )}
    </Box>
  )
}

export default HospitalList
