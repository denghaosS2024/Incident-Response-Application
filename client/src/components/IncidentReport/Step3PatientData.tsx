import {
    Box,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material'
import React from 'react'
import type IIncident from '../../models/Incident'
import StepIndicator from '../common/StepIndicator'

interface Step3PatientDataProps {
    incidentData: IIncident
}

const Step3PatientData: React.FC<Step3PatientDataProps> = ({
    incidentData,
}) => {
    const getStepTitle = () => {
        switch (incidentData.type) {
            case 'F': // Fire
                return 'Fire incident details (latest):'
            case 'M': // Medical
                return "Patient's medical data (latest):"
            case 'P': // Police
                return 'Police incident details (latest):'
            default:
                return 'Incident details (latest):'
        }
    }
    const renderQuestionsByType = () => {
        switch (incidentData.type) {
            case 'F': // Fire
                return renderFireQuestions()
            case 'M': // Medical
                return renderMedicalQuestions()
            case 'P': // Police
                return renderPoliceQuestions()
            default:
                return (
                    <Typography color="error">
                        No questions available for this incident type.
                    </Typography>
                )
        }
    }

    const renderFireQuestions = () => {
        const questions = incidentData.questions || {}

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Is it a structure fire or wildfire?
                    </Typography>
                    <RadioGroup value={questions.fireType || ''} sx={{ ml: 2 }}>
                        <FormControlLabel
                            value="structure fire"
                            control={<Radio disabled />}
                            label="Structure fire"
                        />
                        <FormControlLabel
                            value="wildfire"
                            control={<Radio disabled />}
                            label="Wildfire"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Do you smell smoke?
                    </Typography>
                    <RadioGroup
                        value={questions.hasSmoke ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Do you see flames?
                    </Typography>
                    <RadioGroup
                        value={questions.hasFlames ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Are there any hazardous materials present?
                    </Typography>
                    <RadioGroup
                        value={questions.hasHazards ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        What is the number of people within the fire perimeter?
                    </Typography>
                    <TextField
                        value={questions.numPeople || '0'}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Other Details
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        value={questions.otherDetails || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>
            </Box>
        )
    }

    const renderMedicalQuestions = () => {
        const questions = incidentData.questions || {}

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={questions.isCallerPatient || false}
                                disabled
                            />
                        }
                        label="Caller is the patient"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Username:
                    </Typography>
                    <TextField
                        value={questions.username || incidentData.caller || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Age:
                    </Typography>
                    <TextField
                        value={questions.age || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Sex:
                    </Typography>
                    <RadioGroup value={questions.sex || ''} sx={{ ml: 2 }}>
                        <FormControlLabel
                            value="Female"
                            control={<Radio disabled />}
                            label="Female"
                        />
                        <FormControlLabel
                            value="Male"
                            control={<Radio disabled />}
                            label="Male"
                        />
                        <FormControlLabel
                            value="Other"
                            control={<Radio disabled />}
                            label="Other"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Conscious:
                    </Typography>
                    <RadioGroup
                        value={questions.isConscious ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Breathing:
                    </Typography>
                    <RadioGroup
                        value={questions.isBreathing ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Chief Complaint:
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        value={questions.chiefComplaint || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>
            </Box>
        )
    }

    const renderPoliceQuestions = () => {
        const questions = incidentData.questions || {}

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Are you safe?
                    </Typography>
                    <RadioGroup
                        value={questions.isSafe ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Are there weapons involved?
                    </Typography>
                    <RadioGroup
                        value={questions.hasWeapons ? 'yes' : 'no'}
                        sx={{ ml: 2 }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio disabled />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio disabled />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Suspect Description:
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        value={questions.suspectDescription || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Crime Details:
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        value={questions.crimeDetails || ''}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '.MuiOutlinedInput-root': {
                                borderRadius: 1,
                            },
                        }}
                    />
                </Box>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <StepIndicator currentStep={3} totalSteps={5} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {getStepTitle()}
            </Typography>
            {renderQuestionsByType()}
        </Box>
    )
}

export default Step3PatientData
