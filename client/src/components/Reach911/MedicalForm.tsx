import {
    Button,
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
    SelectChangeEvent
} from '@mui/material'

import React, { useState } from 'react'
import { usePersistantState } from '../../hooks/usePersistantState';
import IIncident from '@/models/Incident';

export interface IProps {
    /**
     * Function to call when the form is submitted
     */
    formData: IIncident
    onChange: (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
}

const MedicalForm: React.FC<IProps> = ({ formData, onChange }) => {
    const [isPatient, setIsPatient] = usePersistantState("isPatient", false)

    const [username, setUserName] = usePersistantState("username", 'Select One')
    const [age, setAge] = usePersistantState("age", 1)
    const [sex, setSex] = usePersistantState("sex", '')
    const [conscious, setConscious] = usePersistantState("conscious", '')
    const [breathing, setBreathing] = usePersistantState("breathing", '')
    const [chiefComplaint, setChiefComplaint] = usePersistantState("chiefComplaint", '')

    const [usernameError, setUserNameError] = useState<string>('');
    const [ageError, setAgeError] = useState<string>('');
    const [sexError, setSexError] = useState<string>('');
    const [consciousError, setConsciousError] = useState<string>('');
    const [breathingError, setBreathingError] = useState<string>('');
    const [chiefComplaintError, setChiefComplaintError] = useState<string>('');

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
                                checked={formData.isPatient}
                                onChange={(e) => onChange("isPatient", e)}
                            />}
                        label="I am the patient"
                    />
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl fullWidth error={!!usernameError}>
                        <InputLabel id="username-label">Username</InputLabel>
                        <Select
                            labelId="username-label"
                            label="Username"
                            value={formData.isPatient ? "User1" : formData.username}
                            onChange={(e) => onChange("username", e)}
                            fullWidth
                        >
                            <MenuItem value="Select One">Select One</MenuItem>
                            {formData.isPatient && <MenuItem value="User1">User1</MenuItem>}
                            <MenuItem value="User2">User2</MenuItem>
                        </Select>
                        <FormHelperText>{usernameError}</FormHelperText>
                    </FormControl>
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Age"
                        fullWidth
                        value={formData.age}
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
                            value={formData.sex}
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
                            value={formData.conscious}
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
                            value={formData.breathing}
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
                        value={formData.chiefComplaint}
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
