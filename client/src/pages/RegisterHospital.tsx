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
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
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
    const [hospitalData, setHospitalData] =
        useState<IHospital>(emptyHospitalData)

    const [errors, setErrors] = useState({
        hospitalName: false,
        hospitalAddress: false,
    })
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        'success' | 'error'
    >('success')

    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('uid')
    const username = localStorage.getItem('username')
    const hospitalFromSlice = useSelector(
        (state: any) => state.hospital.hospitalData,
    )

    const isNurseRegistered = hospitalData.nurses?.some((nurse: any) =>
        typeof nurse === 'object' ? nurse._id === userId : nurse === userId,
    )

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
            const response = await request(
                `/api/hospital?hospitalId=${hospitalId}`,
                {
                    method: 'GET',
                },
            )
            console.log('Fetched hospital details:', response)
            return response
        } catch (error) {
            console.error('Error fetching hospital details:', error)
            return null
        }
    }

    // API call to update an existing hospital
    const updateHospital = async (hospitalData: IHospital) => {
        console.log('Calling API to update hospital.')
        try {
            const response = await request('/api/hospital', {
                method: 'PUT',
                body: JSON.stringify(hospitalData),
                headers: { 'Content-Type': 'application/json' },
            })
            console.log('Hospital updated successfully:', response)
            return response
        } catch (error) {
            console.error('Error updating hospital:', error)
            return null
        }
    }

    /* ------------------------------ FUNCTIONS ------------------------------ */

    /* Function to create or update the hospital discussion (SEM-2563) */
    const updateHospitalDiscussion = async (hospitalData: IHospital) => {
        try {
            const currentUserId = localStorage.getItem('uid')
            if (!currentUserId) {
                console.error('User not logged in')
                return
            }

            // Check if the hospital already has a group
            const hospital: IHospital | null = await fetchHospitalDetails(
                hospitalData.hospitalId,
            )
            if (!hospital) return

            const hospitalGroup = hospital.hospitalGroupId
                    
            if (hospitalGroup != null) {

                const channel = await request(`/api/channels/${hospitalGroup}`, {
                    method: 'GET',
                })

                // if the current user is not registerd
                if (!channel.users.includes(currentUserId)){
                    // If the hospital already has a discussion group, we only need make sure that new nurses are added to it
                    await request(`/api/channels`, {
                        method: 'PUT',
                        body: JSON.stringify({
                        _id: hospitalGroup,
                        users: [...hospitalData.nurses],
                        }),
                    })
                }
            } else {
                // Create a new discussion group, where channelId=hospitalData._id (reason: the format of hospitalId does not match the format of channelId)
                const newHospitalGroup = await request('/api/channels', {
                    method: 'POST',
                    body: JSON.stringify({
                        _id: hospitalData._id,
                        owner: currentUserId,
                        name: hospitalData.hospitalName,
                        users: [...hospitalData.nurses],
                    }),
                })

                // Update the hospital with the new hospitalGroupId
                await request('/api/hospital', {
                    method: 'PUT',
                    body: JSON.stringify({
                        hospitalId: hospitalData.hospitalId,
                        hospitalGroupId: newHospitalGroup._id,
                        nurses: [...hospitalData.nurses],
                    }),
                })
            }

            // // Navigate back to the hospital directory -- confirmed with Cecile
            navigate('/hospitals')
        } catch (error) {
            console.error('Error in updateHospitalDiscussion:', error)
        }
    }

    /* Function to show the alert */
    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message)
        setSnackbarSeverity(severity)
        setOpenSnackbar(true)
    }

    /* Function to register or update a new hospital on submit*/
    const handleSubmit = async () => {
        if (!hospitalData.hospitalName || !hospitalData.hospitalAddress) {
            setErrors({
                hospitalName: !hospitalData.hospitalName,
                hospitalAddress: !hospitalData.hospitalAddress,
            })
            return
        }
        console.log('Submitting hospital:', hospitalData)
        let response

        // Check if hospitalId exists: update if true, else register new hospital
        if (hospitalId) {
            response = await updateHospital(hospitalData)
        } else {
            response = await registerHospital(hospitalData)
        }

        if (response) {
            showSnackbar(
                hospitalId
                    ? 'Hospital updated successfully!'
                    : 'Hospital created successfully!',
                'success',
            )

            console.log(
                'The response after creating an incident is :' + response,
            )
            dispatch(setHospital(response)) // update hospital slice on submit

            setTimeout(() => {
                updateHospitalDiscussion(response)
            }, 2000)
        } else {
            showSnackbar(
                hospitalId
                    ? 'Error updating hospital.'
                    : 'Error registering hospital.',
                'error',
            )
        }
    }

    /* Handle cancellation of hospital registration (SEM-2564) */
    const handleCancel = () => {
        setHospitalData({ ...hospitalFromSlice })
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
                    setHospitalData({
                        ...hospitalData,
                        hospitalName: e.target.value,
                    })
                }
                error={errors.hospitalName}
                helperText={
                    errors.hospitalName ? 'Hospital name is required' : ''
                }
            />

            {/* Hospital Address */}
            <TextField
                label="Address"
                fullWidth
                margin="normal"
                value={hospitalData.hospitalAddress}
                onChange={(e) =>
                    setHospitalData({
                        ...hospitalData,
                        hospitalAddress: e.target.value,
                    })
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
                    startAdornment: (
                        <InputAdornment position="start">🛏️</InputAdornment>
                    ),
                }}
            />

            {/* Total Nurses */}
            <Typography variant="body1" sx={{ mt: 2 }}>
                Nurses:{' '}
                {hospitalData.nurses && hospitalData.nurses.length > 0
                    ? hospitalData.nurses
                          .map((nurse: any) => nurse.username)
                          .join(', ')
                    : 'None Listed'}
            </Typography>

            {/* Show checkbox only if role is 'Nurse' and Nurse is not already registered in hospital */}
            {role === 'Nurse' &&
                (isNurseRegistered ? (
                    <Typography variant="body2" color="textSecondary">
                        You are registered in the hospital.
                    </Typography>
                ) : (
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={(e) => {
                                    if (e.target.checked && userId) {
                                        setHospitalData((prev) => ({
                                            ...prev,
                                            nurses: [...prev.nurses, userId],
                                        }))
                                    }
                                }}
                                color="primary"
                            />
                        }
                        label="I work at this hospital's ER"
                    />
                ))}

            {/* Buttons to submit, cancel or delete */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDelete}
                >
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
