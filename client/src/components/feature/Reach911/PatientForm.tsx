import AddIcon from '@mui/icons-material/Add'
import {
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import IIncident from '../../../models/Incident'
import { loadContacts } from '../../../redux/contactSlice'
import { updateIncident } from '../../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import request from '../../../utils/request'
import { MedicalQuestions } from '../../../utils/types'
import Loading from '../../common/Loading'

const PatientForm: React.FC<{ username?: string }> = ({
    username: propUsername,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    const navigate = useNavigate()
    const medicalQuestions = (incident.questions as MedicalQuestions) ?? {}
    const sex = medicalQuestions.sex ?? ''
    const age = medicalQuestions.age ?? 0
    const name = ''

    const [usernameError, setUserNameError] = useState<string>('')
    const [newUsername, setNewUsername] = useState<string>('')
    const [isCreatingNewAccount, setIsCreatingNewAccount] =
        useState<boolean>(false)

    // Loads contacts upon page loading
    useEffect(() => {
        console.log('Loaded contacts')
        dispatch(loadContacts())
    }, [dispatch])

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // When any input changes, add the changes to the incident slice
    const onChange = (
        field: string,
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>,
    ) => {
        const { type, value, checked } = e.target as HTMLInputElement
        const newValue: string | boolean = type === 'checkbox' ? checked : value

        dispatch(
            updateIncident({
                ...incident,
                questions: {
                    ...(incident.questions ?? {}),
                    [field]: newValue,
                } as MedicalQuestions,
            }),
        )

        // Validate only the changed field
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

    const createNewPatientAccount = () => {
        request('/api/users/createTemp', { method: 'POST' })
            .then((data) => {
                if (data.username) {
                    setNewUsername(data.username)
                    alert(
                        `A new user account has been created for the Patient. \nTemporary Username: ${data.username}, Password: 1234`,
                    )
                } else {
                    alert('Failed to retrieve new username from server.')
                }
            })
            .catch((error) => {
                console.error('Error creating new patient account:', error)
                alert(
                    'Failed to create a new patient account. Please try again later.',
                )
            })
            .finally(() => {
                setIsCreatingNewAccount(false)
            })
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

                {propUsername && propUsername !== 'unknown' ? (
                    <Box width="100%" maxWidth="500px" my={2}>
                        <TextField
                            variant="outlined"
                            label="Username"
                            value={propUsername}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Box>
                ) : (
                    <>
                        <Box width="100%" maxWidth="500px" my={2}>
                            <Typography
                                variant="subtitle1"
                                color="textSecondary"
                            >
                                Username: Unknown
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="center" mt={2}>
                            <button
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                }}
                                onClick={createNewPatientAccount}
                                disabled={isCreatingNewAccount}
                            >
                                {isCreatingNewAccount
                                    ? 'Creating Account...'
                                    : 'Create New Account'}
                            </button>
                        </Box>
                    </>
                )}

                {/**Asks the user for a name */}

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

                {/**Asks the user their date of birth */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        // label="Date of Birth"
                        type="date"
                        fullWidth
                        value={age} // Replace with a state variable for date of birth if needed
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays above the input
                        }}
                        onChange={(e) => onChange('dateOfBirth', e)} // Update the field name accordingly
                    />
                </Box>

                {/**Asks the user their sex */}
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
                    onClick={() =>
                        navigate(`/patient-profile/${incident.patientId || ''}`)
                    }
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
            <Box
                width="100%"
                maxWidth="800px"
                my={4}
                display="flex"
                flexDirection="column"
                alignItems="left"
                paddingX="32px"
            >
                <Typography variant="h6" gutterBottom>
                    Visit Log
                </Typography>
                <Box
                    sx={{
                        overflowX: 'auto',
                    }}
                >
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            textAlign: 'left',
                            border: '1px solid #ddd',
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Date
                                </th>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Location
                                </th>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Link
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {incident.visits?.map((visit, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        {visit.date}
                                    </td>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        {visit.location}
                                    </td>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        <a
                                            href={visit.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#1976d2',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '10px',
                        }}>
                        <AddIcon 
                            onClick={() => {
                                if (propUsername) {
                                    navigate(`/patient-visit?username=${encodeURIComponent(propUsername)}`)
                                } else {
                                    navigate('/patient-visit')
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        /> 
                    </div>
                </Box>
            </Box>
        </>
    )
}

export default PatientForm
