import IHospital from '@/models/Hospital'
import IPatient from '@/models/Patient'
import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'
import PatientCard from './PatientCard'
import request from '@/utils/request'
import { Draggable } from '../Card'

interface HospitalProps {
  hospital: IHospital
  id: string
  index: number
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital, id, index }) => {
  const availableBeds =
    hospital.totalNumberERBeds - hospital.totalNumberOfPatients || 0

  const [patients, setPatients] = useState<IPatient[]>([])

  const fetchPatientsByHospitalId = (hospitalId: string) => {
    request(`/api/patients?hospitalId=${encodeURIComponent(hospitalId)}`, {
      method: 'GET',
    })
      .then((data) => {
        console.log(data)
        setPatients(data)
      })
      .catch((error) => {
        console.error('Error fetching patients by hospital ID:', error)
        setPatients([])
      })
  }

  useEffect(() => {
    fetchPatientsByHospitalId(hospital.hospitalId)
  }, [hospital.hospitalId])

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

            {patients.map((patient, patientIndex) => (
              <PatientCard
                key={patient.patientId}
                id={`patient-${hospital.hospitalId}-${patient.patientId}`} 
                patient={patient}
                index={patientIndex}
                isDraggingOver={true}
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
