import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import request from '../utils/request'

const PatientPlanPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const patientId = searchParams.get('patientId')
  const nurseId = localStorage.getItem('uid')
  const [patientName, setPatientName] = useState('')
  const [medications, setMedications] = useState<any[]>([])
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])
  const [availableExercises, setAvailableExercises] = useState<any[]>([])
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  useEffect(() => {
    if (!patientId) return
    const fetchPlan = async () => {
      try {
        const res = await request(`/api/patientPlan/${patientId}`)
        setMedications(res.medications || [])
        const normalizedIds = (res.exercises || []).map((id: any) =>
          typeof id === 'string' ? id : id._id || String(id)
        )
        setSelectedExerciseIds(normalizedIds)
        setPatientName(res.name || '')
      } catch (err) {
        console.error('Failed to load patient plan:', err)
      }
    }
    fetchPlan()
  }, [patientId])

  useEffect(() => {
    if (!nurseId) return
    const fetchExercises = async () => {
      try {
        const res = await request(`/api/exercises/user/${nurseId}`)
        setAvailableExercises(res)
      } catch (err) {
        console.error('Failed to fetch nurse exercises:', err)
      }
    }
    fetchExercises()
  }, [nurseId])

  const handleDelete = async () => {
    if (deleteIndex === null || !patientId) return
    try {
      await request(`/api/patientPlan/${patientId}/medications/${deleteIndex}`, {
        method: 'DELETE',
      })
      setMedications((prev) =>
        prev.filter((_med, idx) => idx !== deleteIndex)
      )
      setDeleteIndex(null)
    } catch (err) {
      console.error('Failed to delete medication:', err)
    }
  }

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    )
  }

  const handleSaveExercises = async () => {
    if (!patientId) return
    try {
      await request(`/api/patientPlan/${patientId}/exercises`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: selectedExerciseIds }),
      })
    } catch (err) {
      console.error('Failed to save exercises:', err)
    }
  }

  const handleGeneratePlan = async () => {
    setOpenSnackbar(true)
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Medication Plan {patientName}
      </Typography>

      <List>
        {medications.map((med, idx) => (
          <ListItem
            key={idx}
            onClick={() =>
              navigate(`/patients/plan/medication/${idx}?patientId=${patientId}`)
            }
            sx={{ cursor: 'pointer' }}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteIndex(idx)
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${med.name} (${med.frequency}, ${med.time}, ${med.route})`}
              secondary={med.notes}
            />
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          navigate(`/patients/plan/add-medication?patientId=${patientId}`)
        }
      >
        Add Medication
      </Button>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Suggested Exercises
      </Typography>
      <List>
        {availableExercises.map((ex: any) => {
          const checked = selectedExerciseIds.includes(ex._id)
          return (
            <ListItem
              key={ex._id}
              onClick={() => toggleExercise(ex._id)}
              sx={{ cursor: 'pointer' }}
            >
              <Checkbox checked={checked} />
              <ListItemText primary={ex.name} />
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSaveExercises}
        >
          Save Exercises
        </Button>

         
          <Button
            variant="contained"
            color="success"
            onClick={handleGeneratePlan}
          >
            Generate Plan
          </Button>
        
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Plan generated successfully!
        </Alert>
      </Snackbar>

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this medication?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PatientPlanPage
