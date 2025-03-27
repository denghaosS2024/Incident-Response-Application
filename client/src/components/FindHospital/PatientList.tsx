import { Box, Typography } from '@mui/material'
import PatientCard from './PatientCard'
import IUser from '@/models/User'
import { AppDispatch, RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { loadContacts } from '@/redux/contactSlice'
import { useEffect } from 'react'

const PatientList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const patients: IUser[] = useSelector(
    (state: RootState) => state.contactState.contacts,
  )

  useEffect(() => {
    dispatch(loadContacts())
  }, [dispatch])

  return (
    <Box className="w-1/3 border border-gray-300 rounded-lg mb-2">
      <Typography className="text-center p-3 rounded-t-lg bg-mui-blue text-white">
        Patients
      </Typography>

      <Box className="h-99 overflow-scroll">
        {patients.length > 0 ? (
          patients.map((patient, id) => (
            <PatientCard
              key={'patient-' + id}
              id={'patient-' + id}
              patient={patient}
              index={id}
            />
          ))
        ) : (
          <Typography variant="body1" color="text.secondary">
            No patients found.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default PatientList
