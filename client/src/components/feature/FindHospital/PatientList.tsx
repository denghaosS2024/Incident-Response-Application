import IPatient from '@/models/Patient'
import { Box, Typography } from '@mui/material'
import { Droppable } from 'react-beautiful-dnd'
import PatientCard from './PatientCard'

interface PatientListProps {
  patients: IPatient[]
}

const PatientList: React.FC<PatientListProps> = ({ patients }) => {
  return (
    <Box className="w-2/5 border border-gray-300 rounded-lg mb-2">
      <Typography className="text-center p-3 rounded-t-lg bg-mui-blue text-white">
        Patients
      </Typography>

      <Droppable droppableId="patients">
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`h-99 overflow-scroll ${
              snapshot.isDraggingOver ? 'bg-gray-100' : ''
            }`}
          >
            {patients.length > 0 ? (
              patients.map((patient, id) => (
                <PatientCard
                  key={patient.patientId}
                  id={patient.patientId}
                  patient={patient}
                  index={id}
                />
              ))
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                className="p-3 text-center"
              >
                No patients found.
              </Typography>
            )}

            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  )
}

export default PatientList
