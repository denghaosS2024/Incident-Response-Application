import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Typography,
} from '@mui/material'
import request from '../utils/request'

interface ExerciseFormProps {
  patientId: string
  onSave: (selected: string[]) => void
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ patientId, onSave }) => {
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([])
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const userId = localStorage.getItem('uid')
        const res = await request(`/api/exercises/user/${userId}`)
        setExerciseOptions(res || [])
      } catch (err) {
        console.error('Failed to fetch exercises', err)
      }
    }
    fetchExercises()
  }, [])

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name)
        ? prev.filter((e) => e !== name)
        : [...prev, name],
    )
  }

  const handleSubmit = async () => {
    try {
      await request(`/api/patientPlan/${patientId}/exercises`, {
        method: 'PUT',
        body: JSON.stringify({ exercises: selectedExercises }),
        headers: { 'Content-Type': 'application/json' },
      })
      onSave(selectedExercises)
    } catch (err) {
      console.error('Failed to save exercises', err)
    }
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h6" mb={2}>Select Exercises</Typography>
      <List>
        {exerciseOptions.map((exercise) => (
          <ListItem key={exercise}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedExercises.includes(exercise)}
                  onChange={() => toggleExercise(exercise)}
                />
              }
              label={exercise}
            />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={handleSubmit}>Save Exercises</Button>
    </Box>
  )
}

export default ExerciseForm
