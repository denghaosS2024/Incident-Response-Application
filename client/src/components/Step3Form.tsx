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
    FormLabel
} from '@mui/material'

import { NumberField } from '@base-ui-components/react/number-field';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmationDialog from './common/ConfirmationDialog'
import { getItem, setItem } from '../utils/localStorage';
import { usePersistantState } from '../hooks/usePersistantState';

export interface IStep3FormData {
    username: string
    age: number
    sex: string
    conscious: string  
    isPatient: boolean
    breathing: string
    chiefComplaint: string
}

export interface IProps {
    /**
     * Function to call when the form is submitted
     */
    onSubmit: (data: IStep3FormData) => void
}

const Step3Form: React.FC<IProps> = (props: IProps) => {
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

    const clearError = () => {
        setUserNameError('')
        setAgeError('')
        setSexError('')
        setConsciousError('')
        setChiefComplaintError('')
    }
    const onSubmitHandler = () => {
        clearError()

        let hasError = false

        if (!username || username === "Select One") {
            setUserNameError('Select a username')
            hasError = true
        }

        if (age <= 0 || age > 110) {
            setAgeError('Enter a value between 1 and 110')
            hasError = true
        }

        if (!sex) {
            setSexError('Sex can not be empty')
            hasError = true
        }

        if (!conscious) {
            setConsciousError('Conscious state can not be empty')
            hasError = true
        }

        if (!breathing) {
            setBreathingError('Breathing state can not be empty')
            hasError = true
        }

        if (!hasError) {
            props.onSubmit({
                username,
                age,
                sex,
                isPatient,
                conscious,
                breathing,
                chiefComplaint
            })
        }
    }

    // const handleDialogConfirm = () => {
    //     setOpenDialog(false)
    //     props.onSubmit({
    //         username,
    //         password,
    //         phoneNumber,
    //         role,
    //     })
    // }

    // const handleDialogCancel = () => {
    //     setOpenDialog(false)
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
                    <FormControlLabel control={<Checkbox checked={isPatient} onChange={(e) => setIsPatient(e.target.checked)} />} label="I am the patient" />
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl fullWidth error={!!usernameError}>
                        <InputLabel id="username-label">Username</InputLabel>
                        <Select
                            labelId="username-label"
                            label="Username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value as string)}
                            fullWidth
                        >
                            <MenuItem value="Select One">Select One</MenuItem>
                            {isPatient && <MenuItem value="User1">User1</MenuItem>}
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
                        value={age}
                        type="number"
                        error={!!ageError}
                        helperText={ageError}

                        InputProps={{
                            inputProps: {
                                max: 110, min: 1
                            }
                        }}
                        onChange={(e) => setAge(e.target.value as unknown as number)}
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
                            onChange={(e) => setSex(e.target.value)}
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
                            onChange={(e) => setConscious(e.target.value)}
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
                            onChange={(e) => setBreathing(e.target.value)}
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
                        onChange={(e) => setChiefComplaint(e.target.value)}
                    />
                </Box>
                <Box width="100%" maxWidth="500px" my={2}>
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
                </Box>
            </Box>

            {/* <ConfirmationDialog
                open={openDialog}
                title="Confirm Registration"
                description={`Are you sure you want to create a new ${role} account?`}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
            /> */}
        </>
    )
}

export default Step3Form
