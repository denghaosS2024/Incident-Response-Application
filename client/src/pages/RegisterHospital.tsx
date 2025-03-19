import { Box, Button, Checkbox, FormControlLabel, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { useState } from 'react'

const RegisterHospital = () => {

  // TODO : Remove this comment
  /* 
  hospitalName : string
  hospitalAddress : string
  hospitalDescription : string
  numberOfERBeds : int
  nuumberOfPatients : int
  nurses : List<string>
  /*

  /* ------------------------------ CONSTANTS ------------------------------ */

  // TODO : Use client side model interface instead of below variables
  const [hospitalName, setHospitalName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [erBeds, setErBeds] = useState(0)
  const [worksAtER, setWorksAtER] = useState(false)
  const [role] = useState(localStorage.getItem('role'))
  const [errors, setErrors] = useState({ name: false, address: false });

  /* ------------------------------ FUNCTIONS ------------------------------ */

  /* Function to create or update the hospital discussion (SEM-2563) */
  const updateHospitalDiscussion = () => {
    console.log("Updating hospital discussion."); 
    // TODO: Implement discussion update 
  };

  /* Function to register a new hospital on submit */
  const handleSubmit = () => {
    if (!hospitalName || !address) {
      setErrors({
        name: !hospitalName,
        address: !address,
      });
      return;
    }
    console.log("Submitting hospital:", { hospitalName, address, description, erBeds });
    // TODO: API call to register hospital
    updateHospitalDiscussion();
  }

  /* Handle cancellation of hospital registration (SEM-2564) */
  const handleCancel = () => {
    // TODO : Revert back to previous values (GET API call)
  }

  /* Handle deletion of existing hospital (SEM-2565) */
  const handleDelete = () => {
    console.log('Deleting hospital entry')
    // TODO: Implement delete functionality
  }

  /* ------------------------------ RENDER PAGE ------------------------------ */
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>

      {/* Hospital Name */}
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        value={hospitalName}
        onChange={(e) => {
          setHospitalName(e.target.value);
          setErrors({ ...errors, name: false });
        }}
        error={errors.name}
        helperText={errors.name ? "Hospital name is required" : ""}
      />

      {/* Hospital Address */}
      <TextField
        label="Address"
        fullWidth
        margin="normal"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          setErrors({ ...errors, address: false });
        }}
        error={errors.address}
        helperText={errors.address ? "Address is required" : ""}
      />

      {/* Hospital Description */}
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Total ER Beds */}
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

      {/* Total Nurses */}
      <Typography variant="body1" sx={{ mt: 2 }}>
        Nurses: None Listed
      </Typography>

      {/* Show checkbox only if role is 'Nurse' */}
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

      {/* Buttons to submit, cancel or delete */}
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
