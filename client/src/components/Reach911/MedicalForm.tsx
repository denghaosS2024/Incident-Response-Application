import {
    Box,
    MenuItem,
    Select,
    TextField,
    FormControl,
    FormHelperText,
    InputLabel,
    Checkbox,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    SelectChangeEvent,
    Typography
} from '@mui/material'

import React, { useEffect, useState } from 'react'
import IIncident from '../../models/Incident';
import { RootState, MedicalQuestions } from '../../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { updateIncident } from '../../features/incidentSlice';
import { loadContacts } from '../../features/contactSlice';
import { AppDispatch } from '../../app/store';
import IUser from '@/models/User';
import Loading from '../common/Loading';

const MedicalForm: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)
    const isPatient = (incident.questions as MedicalQuestions)?.isPatient
    const sex = (incident.questions as MedicalQuestions)?.sex
    const age = (incident.questions as MedicalQuestions)?.age
    const conscious = (incident.questions as MedicalQuestions)?.conscious
    const breathing = (incident.questions as MedicalQuestions)?.breathing
    const chiefComplaint = (incident.questions as MedicalQuestions)?.chiefComplaint
    const username = (incident.questions as MedicalQuestions)?.username

    const [usernameError, setUserNameError] = useState<string>('');
    const [ageError, setAgeError] = useState<string>('');
    const [sexError, setSexError] = useState<string>('');
    const [consciousError, setConsciousError] = useState<string>('');
    const [breathingError, setBreathingError] = useState<string>('');
    const [chiefComplaintError, setChiefComplaintError] = useState<string>('');


    useEffect(() => {
        dispatch(loadContacts())
    }, [dispatch])

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )
    // Retrieving the name of the current user
    const userId = localStorage.getItem('uid')
    const currentUser = contacts.filter((user: IUser) => user._id === userId)[0]

    const onChange = (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { type, value, checked } = e.target as HTMLInputElement

        dispatch(updateIncident({
            ...incident, // Keep other fields of incident unchanged
            questions: {
                ...(incident.questions ?? {}), // Keep other question fields unchanged
                [field]: type === "checkbox" ? checked : value // Update only the target field
            } as MedicalQuestions
        }));


    };

    // const clearError = () => {
    //     setUserNameError('')
    //     setAgeError('')
    //     setSexError('')
    //     setConsciousError('')
    //     setChiefComplaintError('')
    // }

    // const onSubmitHandler = () => {
    //     clearError()

    //     let hasError = false

    //     if (!username || username === "Select One") {
    //         setUserNameError('Select a username')
    //         hasError = true
    //     }

    //     if (age <= 0 || age > 110) {
    //         setAgeError('Enter a value between 1 and 110')
    //         hasError = true
    //     }

    //     if (!sex) {
    //         setSexError('Sex can not be empty')
    //         hasError = true
    //     }

    //     if (!conscious) {
    //         setConsciousError('Conscious state can not be empty')
    //         hasError = true
    //     }

    //     if (!breathing) {
    //         setBreathingError('Breathing state can not be empty')
    //         hasError = true
    //     }

    //     if (!hasError) {
    //         // props.onSubmit({
    //         //     username,
    //         //     age,
    //         //     sex,
    //         //     isPatient,
    //         //     conscious,
    //         //     breathing,
    //         //     chiefComplaint
    //         // })

    //     }
    // }
    if (loading) return <Loading />
    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                paddingX="32px"
            >

                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPatient}
                                onChange={(e) => onChange("isPatient", e)}
                            />}
                        label="I am the patient"
                    />
                </Box>
                <Box sx={{ display: "flex", width: "100%", alignItems: "start", color: "rgba(0, 0, 0, 0.6)" }}> {/**TODO: Add colors to style guide */}
                    <Typography >Username:</Typography>
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>

                    <FormControl fullWidth error={!!usernameError}>
                        <InputLabel id="username-label">Select One</InputLabel>
                        <Select
                            labelId="username-label"
                            label="Username"
                            value={isPatient ? currentUser?.username || "" : username || ""}
                            onChange={(e) => onChange("username", e)}
                            fullWidth
                        >
                            <MenuItem key="Select One" value="Select One">Select One</MenuItem>
                            {contacts.map((user: IUser) =>
                                <MenuItem key={user._id} value={user.username}>{user.username}</MenuItem>
                            )}

                        </Select>
                        <FormHelperText>{usernameError}</FormHelperText>
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Age"
                        fullWidth
                        value={age}
                        type="number"
                        error={!!ageError}
                        helperText={ageError}

                        InputProps={{
                            inputProps: {
                                max: 110, min: 1
                            }
                        }}
                        onChange={(e) => onChange("age", e)}
                    />
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="sex-label">Sex:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="sex-label"
                            name="sex-radio-buttons-group"
                            value={sex}
                            onChange={(e) => onChange("sex", e)}
                        >
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                        <FormHelperText>{sexError}</FormHelperText>
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="conscious-label">Conscious:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="conscious-label"
                            name="conscious-radio-buttons-group"
                            value={conscious}
                            onChange={(e) => onChange("conscious", e)}
                        >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                        <FormHelperText>{consciousError}</FormHelperText>
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="breathing-label">Breathing:</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="breathing-label"
                            name="breathing-radio-buttons-group"
                            value={breathing}
                            onChange={(e) => onChange("breathing", e)}
                        >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                        <FormHelperText>{breathingError}</FormHelperText>
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Chief Complaint"
                        fullWidth
                        multiline
                        value={chiefComplaint}
                        error={!!chiefComplaintError}
                        helperText={chiefComplaintError}
                        onChange={(e) => onChange("chiefComplaint", e)}
                    />
                </Box>
                {/* <Box width="100%" maxWidth="500px" my={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault()

                            onSubmitHandler()
                        }}
                        fullWidth
                    >
                        Next
                    </Button>
                </Box> */}
            </Box>
        </>
    )
}

export default MedicalForm
