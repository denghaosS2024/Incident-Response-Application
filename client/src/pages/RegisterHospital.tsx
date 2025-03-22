import IHospital from '@/models/Hospital'
import { setHospital } from '@/redux/hospitalSlice'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import request from '../utils/request'

const RegisterHospital: React.FC = () => {
  /* ------------------------------ CONSTANTS ------------------------------ */

  const emptyHospitalData: IHospital = {
    hospitalId: '',
    hospitalName: '',
    hospitalAddress: '',
    hospitalDescription: '',
    totalNumberERBeds: 0,
    totalNumberOfPatients: 0,
    nurses: [],
  }

  const { hospitalId } = useParams<{ hospitalId?: string }>()
  const [hospitalData, setHospitalData] = useState<IHospital>(emptyHospitalData)

  const [errors, setErrors] = useState({
    hospitalName: false,
    hospitalAddress: false,
  })
  const dispatch = useDispatch()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success',
  )

  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')

  /* ------------------------------ USE EFFECTS ------------------------------ */

  useEffect(() => {
    const getHospital = async () => {
      if (hospitalId) {
        const data = await fetchHospitalDetails(hospitalId)
        if (data) {
          setHospitalData(data) // local state
          dispatch(setHospital(data)) // redux state
        }
      } else {
        setHospitalData(emptyHospitalData) // local state
        dispatch(setHospital(emptyHospitalData)) // redux state
      }
    }

    getHospital()
  }, [hospitalId])

  /* ------------------------------ API CALLS ------------------------------ */

  /* API call to register a new hospital */
  const registerHospital = async (hospitalData: IHospital) => {
    console.log('Calling API to register a new hospital.')
    try {
      const response = await request('/api/hospital/register', {
        method: 'POST',
        body: JSON.stringify(hospitalData),
        headers: { 'Content-Type': 'application/json' },
      })
      console.log('Hospital registered successfully:', response)
      return response
    } catch (error) {
      console.error('Error registering hospital:', error)
      return null
    }
  }

  /* API call to fetch details of a hospital based on hospital Id */
  const fetchHospitalDetails = async (hospitalId: string) => {
    console.log('Calling API to fetch hospital details based on hospitalId')
    try {
      const response = await request(`/api/hospital/${hospitalId}`, {
        method: 'GET',
      })
      console.log('Fetched hospital details:', response)
      return response
    } catch (error) {
      console.error('Error fetching hospital details:', error)
      return null
    }
  }

  /* ------------------------------ FUNCTIONS ------------------------------ */

  /* Function to create or update the hospital discussion (SEM-2563) */
  const updateHospitalDiscussion = (hospitalData: IHospital) => {
    console.log('Updating hospital discussion.')
    // TODO: Implement discussion update
  }

  /* Function to show the alert */
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setOpenSnackbar(true)
  }

  /* Function to register a new hospital on submit*/
  const handleSubmit = async () => {
    if (!hospitalData.hospitalName || !hospitalData.hospitalAddress) {
      setErrors({
        hospitalName: !hospitalData.hospitalName,
        hospitalAddress: !hospitalData.hospitalAddress,
      })
      return
    }
    console.log('Submitting hospital:', hospitalData)
    const response = await registerHospital(hospitalData)
    if (response) {
      showSnackbar('Hospital created successfully!', 'success')
      updateHospitalDiscussion(response)
    } else {
      showSnackbar('Error registering hospital.', 'error')
    }
  }

  /* Handle cancellation of hospital registration (SEM-2564) */
  const handleCancel = () => {
    // TODO : Revert back to previous values (GET API call) or use redux
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
        value={hospitalData.hospitalName}
        onChange={(e) =>
          setHospitalData({ ...hospitalData, hospitalName: e.target.value })
        }
        error={errors.hospitalName}
        helperText={errors.hospitalName ? 'Hospital name is required' : ''}
      />

      {/* Hospital Address */}
      <TextField
        label="Address"
        fullWidth
        margin="normal"
        value={hospitalData.hospitalAddress}
        onChange={(e) =>
          setHospitalData({ ...hospitalData, hospitalAddress: e.target.value })
        }
        error={errors.hospitalAddress}
        helperText={errors.hospitalAddress ? 'Address is required' : ''}
      />

      {/* Hospital Description */}
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={hospitalData.hospitalDescription}
        onChange={(e) =>
          setHospitalData({
            ...hospitalData,
            hospitalDescription: e.target.value,
          })
        }
      />

      {/* Total ER Beds */}
      <TextField
        label="Total number ER beds"
        fullWidth
        type="number"
        margin="normal"
        value={hospitalData.totalNumberERBeds}
        onChange={(e) =>
          setHospitalData({
            ...hospitalData,
            totalNumberERBeds: Number(e.target.value),
          })
        }
        InputProps={{
          startAdornment: <InputAdornment position="start">🛏️</InputAdornment>,
        }}
      />

      {/* Total Nurses */}
      <Typography variant="body1" sx={{ mt: 2 }}>
        Nurses: None Listed
      </Typography>

      {/* Show checkbox only if role is 'Nurse' */}
      {role === 'Nurse' && (
        <FormControlLabel
          control={
            <Checkbox
              onChange={(e) => {
                if (e.target.checked && username) {
                  setHospitalData((prev) => ({
                    ...prev,
                    nurses: [...prev.nurses, username],
                  }))
                }
              }}
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

      {/* For Alerts pertaining to hospital registration or updation*/}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default RegisterHospital
