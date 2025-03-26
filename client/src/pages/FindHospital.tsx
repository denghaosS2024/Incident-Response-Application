import HospitalCard from '@/components/FindHospital/HospitalCard'
import PatientCard from '@/components/FindHospital/PatientCard'
import IHospital from '@/models/Hospital'
import IUser from '@/models/User'
import { loadContacts } from '@/redux/contactSlice'
import { fetchHospitals } from '@/redux/hospitalSlice'
import { AppDispatch, RootState } from '@/redux/store'
import eventEmitter from '@/utils/eventEmitter'
import { Map as MapIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const FindHospital: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const hospitals: IHospital[] = useSelector(
    (state: RootState) => state.hospital.hospitals,
  )

  const loading: boolean = useSelector(
    (state: RootState) => state.hospital.loading,
  )

  const error: string | null = useSelector(
    (state: RootState) => state.hospital.error,
  )

  const patients: IUser[] = useSelector(
    (state: RootState) => state.contactState.contacts,
  )

  useEffect(() => {
    dispatch(fetchHospitals())
    dispatch(loadContacts())
  }, [dispatch])

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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
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
          <Box className="w-2/3">
            {hospitals.length > 0 ? (
              hospitals.map((hospital, id) => (
                <HospitalCard
                  key={'hospital-' + id}
                  id={'hospital-' + id}
                  hospital={hospital}
                />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No hospitals found. Please register hospitals first.
              </Typography>
            )}
          </Box>
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
