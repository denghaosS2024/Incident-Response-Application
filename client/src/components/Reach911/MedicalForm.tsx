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
import IUser from '../../models/User';
import Loading from '../common/Loading';

const MedicalForm: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)
    const medicalQuestions = (incident.questions as MedicalQuestions) ?? {};

    const isPatient = medicalQuestions.isPatient ?? false;
    const sex = medicalQuestions.sex ?? "";
    const age = medicalQuestions.age ?? 0;
    const conscious = medicalQuestions.conscious ?? "";
    const breathing = medicalQuestions.breathing ?? "";
    const chiefComplaint = medicalQuestions.chiefComplaint ?? "";
    const username = medicalQuestions.username ?? "";

    const [usernameError, setUserNameError] = useState<string>('');
    const [ageError, setAgeError] = useState<string>('');

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
        const { type, value, checked } = e.target as HTMLInputElement;
        const newValue : string | boolean = type === "checkbox" ? checked : value;

        dispatch(updateIncident({
            ...incident,
            questions: {
                ...(incident.questions ?? {}),
                [field]: newValue
            } as MedicalQuestions
        }));

        // Validate only the changed field
        validateField(field, newValue);
    };

    const validateField = (field: string, value: string | boolean) => {
        if (field === "username") {
            setUserNameError(!value || value === "Select One" ? "Select a username" : "");
        }

        if (field === "age") {
            const parsedAge = Number(value); // Convert to number

            if (parsedAge && (parsedAge <= 0 || parsedAge > 110)) {
                setAgeError("Enter a value between 1 and 110");
            } else {
                setAgeError("");
            }
        }
    };


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
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Chief Complaint"
                        fullWidth
                        multiline
                        value={chiefComplaint}
                        onChange={(e) => onChange("chiefComplaint", e)}
                    />
                </Box>
            </Box>
        </>
    )
}

export default MedicalForm
