import IUser from '@/models/User'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

interface PatientProps {
  patient: IUser
  id: string
  index: number
}

const PatientCard: React.FC<PatientProps> = ({ patient, id, index }) => {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <Box ref={provided.innerRef} {...provided.droppableProps}>
          <Draggable draggableId={id} index={index}>
            {(providedDrag, snapshot) => (
              <Box
                ref={providedDrag.innerRef}
                {...providedDrag.draggableProps}
                {...providedDrag.dragHandleProps}
                className="border border-gray-300 w-full rounded-lg p-3 mb-2"
              >
                <Typography variant="body2" className="text-sm text-gray-500">
                  {patient.username}
                </Typography>
              </Box>
            )}
          </Draggable>
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  )
}

export default PatientCard
