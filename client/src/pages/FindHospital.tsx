import HospitalList from '@/components/FindHospital/HospitalList'
import PatientList from '@/components/FindHospital/PatientList'
import eventEmitter from '@/utils/eventEmitter'
import { Map as MapIcon } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useNavigate } from 'react-router-dom'

const FindHospital: React.FC = () => {
  const navigate = useNavigate()

  // Navigate to map and activate hospital layer
  const redirectToMapWithHospitals = () => {
    // Navigate to the map page
    navigate('/map')

    // Emit event to activate the hospital layer after a small delay to ensure
    // the map component is loaded and event listeners are attached
    setTimeout(() => {
      eventEmitter.emit('selectUtil', { layer: 'Util', visible: true })
      eventEmitter.emit('selectUtil', { layer: 'Hospitals', visible: true })
    }, 500)
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination || source.droppableId === destination.droppableId) return

    if (draggableId.startsWith('patient-')) {
      // // Handle group card drop
      // const groupId = draggableId.slice(6) // Extract group ID from the draggableId
      // //handleGroupClick(groupId) // This will handle adding users of the group to the 'done' column
      // return
      console.log('drag')
    }

    //const task = findItemById(String(draggableId), [...todo, ...done]) // Ensure ID is a string
    //if (!task) return // Prevent errors if the task is not found

    //deletePreviousState(source.droppableId, draggableId)
    //setNewState(destination.droppableId, task)
  }

  return (
    <Box padding={2}>
      <Box marginY={2}>
        <Typography variant="body1" gutterBottom>
          Drag and drop patients:
        </Typography>
      </Box>

      <Box className="flex flex-row justify-between gap-x-4">
        <DragDropContext onDragEnd={handleDragEnd} key={0}>
          <PatientList></PatientList>
          <HospitalList></HospitalList>
        </DragDropContext>
      </Box>

      <Box display="flex" justifyContent="center" marginY={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MapIcon />}
          onClick={redirectToMapWithHospitals}
          size="large"
        >
          See Hospitals on Map
        </Button>
      </Box>
    </Box>
  )
}

export default FindHospital
