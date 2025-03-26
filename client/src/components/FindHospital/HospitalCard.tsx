import IHospital from '@/models/Hospital'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'

interface HospitalProps {
  hospital: IHospital
  id: string
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital, id }) => {
  const availableBeds =
    hospital.totalNumberERBeds - hospital.totalNumberOfPatients || 0
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box className="border border-gray-300 rounded-lg p-3 mb-2">
          <Box className="flex flex-row justify-between">
            <Typography className="font-extrabold" fontWeight="bold">
              {hospital.hospitalName}
            </Typography>
            <Typography className="text-gray-500">
              {availableBeds} - ({hospital.totalNumberERBeds || 0}) Beds
            </Typography>
          </Box>

          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="border-t border-gray-300 pt-3 mt-3"
          >
            {provided.placeholder}
          </Box>
        </Box>
      )}
    </Droppable>
  )
}

export default HospitalCard
