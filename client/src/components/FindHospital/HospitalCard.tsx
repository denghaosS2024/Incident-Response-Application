import IHospital from '@/models/Hospital'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'

interface HospitalProps {
  hospital: IHospital
  id: string
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital, id }) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box className="border border-gray-300 rounded-lg p-3 mb-2">
          <Typography></Typography>

          <Typography className="font-extrabold" fontWeight="bold">
            {hospital.hospitalName}
          </Typography>
          <Typography variant="body2" className="text-sm">
            {hospital.hospitalAddress}
          </Typography>
          <Typography variant="body2" className="text-sm text-gray-500">
            Total ER Beds: {hospital.totalNumberERBeds || 0}
          </Typography>

          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {provided.placeholder}
          </Box>
        </Box>
      )}
    </Droppable>
  )
}

export default HospitalCard
