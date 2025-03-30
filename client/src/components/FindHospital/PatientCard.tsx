import IPatient from '@/models/Patient'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'

interface PatientProps {
  patient: IPatient
  id: string
  index: number
  isDraggingOver: boolean
}

const PatientCard: React.FC<PatientProps> = ({
  patient,
  id,
  index,
  isDraggingOver,
}) => {
  const droppableId = `droppable-${id}-${patient.patientId}` // Unique droppableId per patient
  const draggableId = `draggable-${id}-${patient.patientId}` // Unique draggableId per patient


  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <Box ref={provided.innerRef} {...provided.droppableProps}>
          <Draggable draggableId={draggableId} index={index}>
            {(providedDrag, snapshotDrag) => (
              <Box
                ref={providedDrag.innerRef}
                {...providedDrag.draggableProps}
                {...providedDrag.dragHandleProps}
                className={
                  isDraggingOver || snapshotDrag.isDragging
                    ? 'border border-gray-300 rounded-lg w-fit p-3'
                    : 'border-b border-gray-300 w-fit p-3'
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
