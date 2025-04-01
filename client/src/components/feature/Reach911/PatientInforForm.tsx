import IPatient from '@/models/Patient'
import {
    addPatient,
    fetchPatients,
    setPatient,
    updatePatient,
} from '@/redux/patientSlice'
import {
    Box,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import IUser from '../../../models/User'
import { loadContacts } from '../../../redux/contactSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import request from '../../../utils/request'
import Loading from '../../common/Loading'

const PatientInforForm: React.FC<{ username?: string; sex?: string }> = ({
    username: propUsername,
    sex: propSex,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const [currentUsername, setcurrentUsername] = useState<string>(
        propUsername || '',
    )
    const patients: IPatient[] = useSelector(
        (state: RootState) => state.patientState.patients,
    )
    const [isFetchingPatients, setIsFetchingPatients] = useState(true)
    useEffect(() => {
        dispatch(loadContacts())
        const fetchData = async () => {
            await dispatch(fetchPatients()) // Wait for fetchPatients to complete
            setIsFetchingPatients(false) // Mark fetching as complete
        }
        fetchData()
    }, [dispatch])
    const [isPatientAdded, setIsPatientAdded] = useState(false)

    let patient: IPatient =
        patients.find((p) => p.username === currentUsername) || ({} as IPatient)

    if (
        !isFetchingPatients &&
        !patient.username &&
        propUsername &&
        !isPatientAdded
    ) {
        console.log('patientUsername is empty')
        patient = {
            username: propUsername,
            name: '',
            sex: propSex || '',
            dob: '',
            patientId: uuidv4(), // Generate a unique ID for the new patient
        }
        dispatch(addPatient(patient))
        setIsPatientAdded(true)
    }

    const navigate = useNavigate()
    const username = patient.username ?? null
    const name = patient.name ?? ''
    const sex = patient.sex ?? ''
    const dob = patient.dob ?? ''
    const userId = localStorage.getItem('uid') || ''
    const [usernameError, setUserNameError] = useState<string>('')

    // Loads contacts upon page loading

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // When any input changes, add the changes to the incident slice
    const onChange = async (
        field: string,
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>,
    ) => {
        const { type, value, checked } = e.target as HTMLInputElement
        const newValue: string | boolean = type === 'checkbox' ? checked : value

        if (field === 'username') {
            if (value === 'create-one') {
                try {
                    const response = await request('/api/users/createTemp', {
                        method: 'POST',
                    })

                    if (response && response.userId && response.username) {
                        patient = {
                            username: response.username,
                            name: '',
                            sex: propSex || '',
                            dob: '',
                            patientId: uuidv4(),
                        }
                        dispatch(addPatient(patient))

                        setcurrentUsername(response.username)

                        const newContact: IUser = {
                            _id: response.userId,
                            username: response.username,
                            role: 'Citizen',
                        }

                        dispatch(loadContacts())

                        alert(
                            `A new user account has been created for the Patient.\nTemporary Username: ${response.username}, Password: 1234`,
                        )
                    } else {
                        alert(
                            'Failed to create a new patient account. Please try again.',
                        )
                    }
                } catch (error) {
                    console.error('Error creating new patient account:', error)
                    alert(
                        'Failed to create a new patient account. Please try again later.',
                    )
                }
                return
            }

            patient =
                patients.find((p) => p.username === value) || ({} as IPatient)
            if (Object.keys(patient).length === 0) {
                patient = {
                    username: value,
                    name: '',
                    sex: propSex || '',
                    dob: '',
                    patientId: uuidv4(),
                }
                dispatch(addPatient(patient))
            }
            setcurrentUsername(value)
        } else {
            dispatch(
                setPatient({
                    ...patient,
                    [field]: newValue,
                }),
            )
            dispatch(
                updatePatient({
                    ...patient,
                    [field]: newValue,
                }),
            )
        }

        validateField(field, newValue)
    }

    // Validates field to set certain error messages
    const validateField = (field: string, value: string | boolean) => {
        if (field === 'username') {
            setUserNameError(
                !value || value === 'Select One' ? 'Select a username' : '',
            )
        }
    }

    const handleProfileClick = async () => {
        if (!username) {
            alert('Username is missing.')
            return
        }

        try {
            const response = await request(
                `/api/users/findByUsername?username=${username}`,
                {
                    method: 'GET',
                },
            )

            if (response && response.userId) {
                const fetchedUserId = response.userId
                console.log('Fetched userId:', fetchedUserId)
                navigate(`/profile/${fetchedUserId}`)
            } else {
                alert(
                    'User not found. Please make sure the username is correct.',
                )
            }
        } catch (error) {
            console.error('Failed to fetch userId by username:', error)
            alert('Error fetching user information. Please try again later.')
        }
    }

    if (loading) return <Loading />

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                paddingX="32px"
            >
                <Box
                    sx={{
                        display: 'flex',
                        maxWidth: '500px',
                        width: '100%',
                        alignItems: 'start',
                        color: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Typography>Patient Username:</Typography>
                </Box>

                {!propUsername ? (
                    <Box width="100%" maxWidth="500px" my={2}>
                        <FormControl fullWidth error={!!usernameError}>
                            <InputLabel id="username-label">
                                Select One
                            </InputLabel>
                            <Select
                                labelId="username-label"
                                label="Username"
                                value={currentUsername}
                                onChange={(e) => onChange('username', e)}
                                fullWidth
                            >
                                <MenuItem value="create-one">
                                    Create One
                                </MenuItem>

                                {contacts.map((user: IUser) => (
                                    <MenuItem
                                        key={user._id}
                                        value={user.username}
                                    >
                                        {user.username}
                                    </MenuItem>
                                ))}
                            </Select>

                            <FormHelperText>{usernameError}</FormHelperText>
                        </FormControl>
                    </Box>
                ) : (
                    <Box width="100%" maxWidth="500px" my={2}>
                        {/* <TextField
                            variant="outlined"
                            label="Username"
                            value={propUsername}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                        /> */}
                        <Typography>{propUsername}</Typography>
                    </Box>
                )}

                {/** Asks the user for a name */}
                <Box
                    sx={{
                        display: 'flex',
                        maxWidth: '500px',
                        width: '100%',
                        alignItems: 'start',
                        color: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Typography>Name:</Typography>
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Name"
                        value={name || ''}
                        onChange={(e) => onChange('name', e)}
                        fullWidth
                        error={!!usernameError}
                        helperText={usernameError}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        maxWidth: '500px',
                        width: '100%',
                        alignItems: 'start',
                        color: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    <Typography>Date of Birth:</Typography>
                </Box>

                {/** Asks the user their date of birth */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        // label="Date of Birth"
                        type="date"
                        fullWidth
                        value={dob} // Replace with a state variable for date of birth if needed
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays above the input
                        }}
                        onChange={(e) => onChange('dob', e)} // Update the field name accordingly
                    />
                </Box>

                {/** Asks the user their sex */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="sex-label">Sex:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="sex-label"
                            name="sex-radio-buttons-group"
                            value={sex}
                            onChange={(e) => onChange('sex', e)}
                        >
                            <FormControlLabel
                                value="female"
                                control={<Radio />}
                                label="Female"
                            />
                            <FormControlLabel
                                value="male"
                                control={<Radio />}
                                label="Male"
                            />
                            <FormControlLabel
                                value="other"
                                control={<Radio />}
                                label="Other"
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Box>

            <Box display="flex" justifyContent="center" mt={4}>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                    onClick={handleProfileClick}
                >
                    Profile
                </button>
            </Box>
            <hr
                style={{
                    margin: '20px 0',
                    border: '1px solid #000',
                }}
            />
        </>
    )
}

export default PatientInforForm
