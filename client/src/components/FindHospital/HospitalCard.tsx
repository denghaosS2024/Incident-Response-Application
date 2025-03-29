import IHospital from '@/models/Hospital'
import IPatient from '@/models/Patient'
import { fetchPatients } from '@/redux/patientSlice'
import { AppDispatch, RootState } from '@/redux/store'
import { Box, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import PatientCard from './PatientCard'

interface HospitalProps {
  hospital: IHospital
  id: string
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital, id }) => {
  const availableBeds =
    hospital.totalNumberERBeds - hospital.totalNumberOfPatients || 0


  const patients: IPatient[] = useSelector(
    (state: RootState) => state.patientState.patients,
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchPatients())
  }, [dispatch])

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box className="border border-gray-300 rounded-lg p-3 mb-2">
          <Box>
            <Typography className="font-extrabold" fontWeight="bold">
              {hospital.hospitalName}
            </Typography>
            <Box className="flex flex-row justify-between">
              <Typography className="text-gray-500">
                {hospital.distance}m
              </Typography>
              <Typography className="text-gray-500">
                {availableBeds} - ({hospital.totalNumberERBeds || 0}) Beds
              </Typography>
            </Box>
          </Box>

          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="border-t border-gray-300 pt-3 mt-3"
          >
            {patients.length > 0 ? (
              patients.map((patient, hospitalID) => (
                <PatientCard
                  key={'patient-inHospital' + id}
                  id={'patient-inHospital' + id}
                  patient={patient}
                  index={hospitalID}
                  isInHopital={true}
                />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No patients found.
              </Typography>
            )}

            {provided.placeholder}
          </Box>
        </Box>
      )}
    </Droppable>
  )
}

export default HospitalCard
