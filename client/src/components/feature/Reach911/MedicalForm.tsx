import {
    Box,
    Checkbox,
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
import IIncident from '../../../models/Incident'
import IUser from '../../../models/User'
import { loadContacts } from '../../../redux/contactSlice'
import { updateIncident } from '../../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import { MedicalQuestions } from '../../../utils/types'
import Loading from '../../common/Loading'

interface MedicalFormProps {
    isCreatedByFirstResponder?: boolean
    formIndex: number
}

const MedicalForm: React.FC<MedicalFormProps> = ({
    isCreatedByFirstResponder,
    formIndex,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    let medicalQuestions: MedicalQuestions
    if (Array.isArray(incident.questions) && incident.questions[formIndex]) {
        medicalQuestions = incident.questions[formIndex]
    } else {
        medicalQuestions = {
            isPatient: false,
            username: '',
            age: 0,
            sex: '',
            conscious: '',
            breathing: '',
            chiefComplaint: '',
        }
    }

    const isPatient = medicalQuestions.isPatient ?? false
    const sex = medicalQuestions.sex ?? ''
    const age = medicalQuestions.age ?? 0
    const conscious = medicalQuestions.conscious ?? ''
    const breathing = medicalQuestions.breathing ?? ''
    const chiefComplaint = medicalQuestions.chiefComplaint ?? ''
    const username = medicalQuestions.username ?? ''

    const [usernameError, setUserNameError] = useState<string>('')
    const [ageError, setAgeError] = useState<string>('')

    const token = localStorage.getItem('token')
    const uid = localStorage.getItem('uid')

    // Loads contacts upon page loading
    useEffect(() => {
        dispatch(loadContacts())
    }, [dispatch])

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // Retrieving the name of the current user
    const userId = localStorage.getItem('uid')
    const currentUser = contacts.filter((user: IUser) => user._id === userId)[0]

    // When any input changes, add the changes to the incident slice
    const onChange = async (
        field: string,
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<string>,
    ) => {
        const { type, value, checked } = e.target as HTMLInputElement
        const newValue: string | boolean = type === 'checkbox' ? checked : value

        const updatedQuestions = Array.isArray(incident.questions)
            ? [...incident.questions]
            : []

        updatedQuestions[formIndex] = {
            ...(updatedQuestions[formIndex] ?? {}),
            [field]: newValue,
        } as MedicalQuestions
        console.log(incident.questions)
        if (await validateField(field, newValue)) {
            dispatch(
                updateIncident({
                    ...incident,
                    questions: updatedQuestions,
                }),
            )
        }

        // Validate only the changed field
    }

    // Validates field to set certain error messages
    const validateField = async (
        field: string,
        value: string | boolean,
    ): Promise<boolean> => {
        let isValid = true

        if (field === 'username') {
            setUserNameError(
                !value || value === 'Select One' ? 'Select a username' : '',
            )
            // Check for duplicate usernames in the questions array
            const isDuplicateUsername = Array.isArray(incident.questions)
                ? incident.questions.some(
                      (question, index) =>
                          index !== formIndex && question?.username === value,
                  )
                : false

            if (!value || value === 'Select One' || isDuplicateUsername) {
                setUserNameError(
                    isDuplicateUsername
                        ? 'This username does not meet the rule'
                        : 'Select a username',
                )
                isValid = false
            }

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/incidents/${username}/active`,
                {
                    headers: {
                        'x-application-token': token || '',
                        'x-application-uid': uid || '',
                    },
                },
            )
            console.log('response: ', response)
            if (response.ok) {
                const responseData = await response.json()
                if (
                    responseData.incidentId &&
                    responseData.incidentId !== incident._id
                ) {
                    setUserNameError(
                        'This username is already associated with another active incident',
                    )
                    isValid = false
                }
            }
        }

        // Checks that the age is between 1 and 110
        if (field === 'age') {
            const parsedAge = Number(value) // Convert to number

            if (!parsedAge || parsedAge <= 0 || parsedAge > 110) {
                setAgeError('Enter a value between 1 and 110')
                isValid = false
            } else {
                setAgeError('')
            }
        }

        if (field === 'isPatient') {
            const isAnotherPatient = Array.isArray(incident.questions)
                ? incident.questions.some(
                      (question, index) =>
                          index !== formIndex && question?.isPatient === true,
                  )
                : false

            if (isAnotherPatient && value === true) {
                isValid = false
                alert('Another form already has "I am the patient" selected.')
            }
        }

        return isValid
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
                {/**If not created by a first responder then show a checkbox asking if they are the patient */}
                {!isCreatedByFirstResponder && (
                    <Box width="100%" maxWidth="500px" my={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isPatient}
                                    onChange={(e) => onChange('isPatient', e)}
                                />
                            }
                            label={
                                incident.incidentState === 'Assigned' ||
                                incident.incidentState === 'Triage'
                                    ? 'Caller is the patient'
                                    : 'I am the patient'
                            }
                        />
                    </Box>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        maxWidth: '500px',
                        width: '100%',
                        alignItems: 'start',
                        color: 'rgba(0, 0, 0, 0.6)',
                    }}
                >
                    {/**TODO: Add colors to style guide */}
                    <Typography>Username:</Typography>
                </Box>

                {/**Asks the user for a username */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl fullWidth error={!!usernameError}>
                        <InputLabel id="username-label">Select One</InputLabel>
                        <Select
                            labelId="username-label"
                            label="Username"
                            value={username}
                            onChange={(e) => onChange('username', e)}
                            fullWidth
                        >
                            <MenuItem key="unknown" value="unknown">
                                Unknown
                            </MenuItem>
                            {contacts.map((user: IUser) => (
                                <MenuItem key={user._id} value={user.username}>
                                    {user.username}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{usernameError}</FormHelperText>
                    </FormControl>
                </Box>

                {/**Asks the user their age */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Age"
                        fullWidth
                        value={age}
                        error={!!ageError}
                        helperText={ageError}
                        InputProps={{
                            inputProps: {
                                inputMode: 'numeric', // Forces numeric keyboard on iOS
                                pattern: '[0-9]*', // Ensures only numbers are entered
                                max: 110,
                                min: 1,
                            },
                        }}
                        onChange={(e) => onChange('age', e)}
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

                {/**Asks the user if the patient is conscious */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="conscious-label">Conscious:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="conscious-label"
                            name="conscious-radio-buttons-group"
                            value={conscious}
                            onChange={(e) => onChange('conscious', e)}
                        >
                            <FormControlLabel
                                value="yes"
                                control={<Radio />}
                                label="Yes"
                            />
                            <FormControlLabel
                                value="no"
                                control={<Radio />}
                                label="No"
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/**Asks the user what the chief complaint is */}
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="breathing-label">Breathing:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="breathing-label"
                            name="breathing-radio-buttons-group"
                            value={breathing}
                            onChange={(e) => onChange('breathing', e)}
                        >
                            <FormControlLabel
                                value="yes"
                                control={<Radio />}
                                label="Yes"
                            />
                            <FormControlLabel
                                value="no"
                                control={<Radio />}
                                label="No"
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/**Chief complaint question*/}
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Chief Complaint"
                        fullWidth
                        multiline
                        value={chiefComplaint}
                        onChange={(e) => onChange('chiefComplaint', e)}
                    />
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <Box display="flex" justifyContent="center">
                        <button
                            style={{
                                width: '50%',
                                padding: '10px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                            onClick={() => {
                                const selectedUsername = isPatient
                                    ? currentUser?.username || ''
                                    : username || ''
                                const targetUrl = selectedUsername
                                    ? `/patients?username=${encodeURIComponent(selectedUsername)}`
                                    : '/patients'
                                window.location.href = targetUrl
                            }}
                        >
                            Treat Patient
                        </button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default MedicalForm
