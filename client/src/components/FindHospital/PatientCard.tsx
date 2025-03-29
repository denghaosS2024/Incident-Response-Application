import IPatient from '@/models/Patient'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

interface PatientProps {
  patient: IPatient
  id: string
  index: number
  isInHopital: boolean
}

const PatientCard: React.FC<PatientProps> = ({ patient, id, index, isInHopital }) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box ref={provided.innerRef} {...provided.droppableProps}>
          <Draggable draggableId={id} index={index}>
            {(providedDrag, snapshotDrag) => (
              <Box
                ref={providedDrag.innerRef}
                {...providedDrag.draggableProps}
                {...providedDrag.dragHandleProps}
                className={
                  snapshotDrag.isDragging
                    ? 'border border-gray-300 rounded-lg w-full p-3'
                    : 'border-b border-gray-300 w-full p-3'
                }
              >
                <Typography variant="body2" className="text-sm text-gray-500">
                  {patient.name}
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
