import IHospital from '@/models/Hospital'
import IPatient from '@/models/Patient'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import PatientCard from './PatientCard'

interface HospitalProps {
  hospital: IHospital
  id: string
  index: number
  patients: IPatient[]
}

const HospitalCard: React.FC<HospitalProps> = ({
  hospital,
  id,
  patients,
}) => {
  const availableBeds =
    hospital.totalNumberERBeds - hospital.patients.length || 0

  return (
    <Droppable droppableId={id}>
      {(provided) => (
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
            {patients.map((patient, patientIndex) => (
              <PatientCard
                key={patient.patientId}
                id={`patient-${hospital.hospitalId}-${patient.patientId}`}
                patient={patient}
                index={patientIndex}
              />
            ))}

            {patients.length === 0 && (
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
