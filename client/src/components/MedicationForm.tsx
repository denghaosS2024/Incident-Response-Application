import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import React, { useState } from 'react'

interface MedicationFormProps {
  data?: {
    name: string
    frequency: string
    time: string
    route: string
    notes: string
  }
  readOnly?: boolean
  onSave?: (formData: {
    name: string
    frequency: string
    time: string
    route: string
    notes: string
  }) => void
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  data = { name: '', frequency: '', time: '', route: '', notes: '' },
  readOnly = false,
  onSave
}) => {
  const [form, setForm] = useState(data)
  const [errors, setErrors] = useState({
    name: false,
    frequency: false,
    time: false,
    route: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: false }))
  }

  const handleSave = () => {
    const newErrors = {
      name: !form.name.trim(),
      frequency: !form.frequency.trim(),
      time: !form.time.trim(),
      route: !form.route.trim()
    }
    setErrors(newErrors)

    const hasError = Object.values(newErrors).some(v => v)
    if (hasError) return

    onSave?.(form)
  }

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Medication Details
      </Typography>

      <TextField
        required
        name="name"
        label="Medication Name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={readOnly}
        error={errors.name}
        helperText={errors.name ? 'Name is required' : ''}
      />
      <TextField
        required
        name="frequency"
        label="Frequency"
        value={form.frequency}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={readOnly}
        error={errors.frequency}
        helperText={errors.frequency ? 'Frequency is required' : ''}
      />
      <TextField
        required
        name="time"
        label="Time of Day"
        value={form.time}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={readOnly}
        error={errors.time}
        helperText={errors.time ? 'Time is required' : ''}
      />
      <TextField
        required
        select
        name="route"
        label="Route"
        value={form.route}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled={readOnly}
        error={errors.route}
        helperText={errors.route ? 'Route is required' : ''}
      >
        <MenuItem value="">Select a route</MenuItem>
        <MenuItem value="oral">oral</MenuItem>
        <MenuItem value="injection">injection</MenuItem>
        <MenuItem value="topical">topical</MenuItem>
      </TextField>
      <TextField
        name="notes"
        label="Notes"
        value={form.notes}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
        disabled={readOnly}
      />

      {!readOnly && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      )}
    </Box>
  )
}

export default MedicationForm
