import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography
  } from '@mui/material'
  import React from 'react'
  
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
    const [form, setForm] = React.useState(data)
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setForm(prev => ({ ...prev, [name]: value }))
    }
  
    return (
      <Box p={2}>
        <Typography variant="h6" mb={2}>
          Medication Details
        </Typography>
  
        <TextField
          name="name"
          label="Medication Name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={readOnly}
        />
        <TextField
          name="frequency"
          label="Frequency"
          value={form.frequency}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={readOnly}
        />
        <TextField
          name="time"
          label="Time of Day"
          value={form.time}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={readOnly}
        />
        <TextField
          select
          name="route"
          label="Route"
          value={form.route}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={readOnly}
        >
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
  
         
          <Button variant="contained" color="primary"  onClick={() => onSave?.(form)} sx={{ mt: 2 }}>
            Save
          </Button>
        
      </Box>
    )
  }
  
  export default MedicationForm
  