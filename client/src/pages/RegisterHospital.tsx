import { Box, Button, Checkbox, FormControlLabel, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterHospital = () => {

  /* ------------------------------ CONSTANTS ------------------------------ */

  const [hospitalName, setHospitalName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [erBeds, setErBeds] = useState(0)
  const [worksAtER, setWorksAtER] = useState(false)
  const [role, setRole] = useState(localStorage.getItem('role'))
  const navigate = useNavigate()

  /* ------------------------------ FUNCTIONS ------------------------------ */
  const handleSubmit = () => {
    const hospitalData = { hospitalName, address, description, erBeds }
    console.log('Registering hospital:', hospitalData)
    // TODO: Make API request to register hospital
  }

  const handleCancel = () => {
    // TODO :
  }

  const handleDelete = () => {
    console.log('Deleting hospital entry')
    // TODO: Implement delete functionality
  }

  /* ------------------------------ RENDER PAGE ------------------------------ */
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={hospitalName}
        onChange={(e) => setHospitalName(e.target.value)}
      />

      <TextField
        label="Address"
        fullWidth
        margin="normal"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <TextField
        label="Total number ER beds"
        fullWidth
        type="number"
        margin="normal"
        value={erBeds}
        onChange={(e) => setErBeds(Number(e.target.value))}
        InputProps={{
          startAdornment: <InputAdornment position="start">🛏️</InputAdornment>,
        }}
      />
      
      {role === "Nurse" && (
        <FormControlLabel
          control={
            <Checkbox
              checked={worksAtER}
              onChange={(e) => setWorksAtER(e.target.checked)}
              color="primary"
            />
          }
          label="I work at this hospital's ER"
        />
      )}

      <Typography variant="body1" sx={{ mt: 2 }}>
        Nurses: None Listed
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="contained" color="primary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleDelete}>
          Delete
        </Button>
      </Box>
    </Paper>
  )
}

export default RegisterHospital
