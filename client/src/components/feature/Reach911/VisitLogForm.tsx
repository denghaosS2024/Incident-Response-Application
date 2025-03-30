import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, FormControl, FormControlLabel, IconButton, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Loading from '../../common/Loading';

// Default: E
const priorities = [
    { value: 'Immediate', label: 'E' },
    { value: 'Urgent', label: '1' },
    { value: 'Could Wait', label: '2' },
    { value: 'Dismiss', label: '3' },
    { value: 'Dead', label: '4' },
]

const locations = [
    { value: 'Road', label: 'Road' },
    { value: 'ER', label: 'ER' },
]

const conditions = [
    { value: 'Allergy', label: 'Allergy' },
    { value: 'Asthma', label: 'Asthma' },
    { value: 'Bleeding', label: 'Bleeding' },
    { value: 'Broken bone', label: 'Broken bone' },
    { value: 'Burn', label: 'Burn' },
    { value: 'Choking', label: 'Choking' },
    { value: 'Concussion', label: 'Concussion' },
    { value: 'Covid-19', label: 'Covid-19' },
    { value: 'Heart Attack', label: 'Heart Attack' },
    { value: 'Heat Stroke', label: 'Heat Stroke' },
    { value: 'Hypothermia', label: 'Hypothermia' },
    { value: 'Poisoning', label: 'Poisoning' },
    { value: 'Seizure', label: 'Seizure' },
    { value: 'Shock', label: 'Shock' },
    { value: 'Strain', label: 'Strain' },
    { value: 'Sprain', label: 'Sprain' },
    { value: 'Stroke', label: 'Stroke' },
]

// Returns the current date and time formatted as "MM.DD.YY-HH:mm"
// Example formats: "12.03.21-10:00" or "11.22.20-08:00"
const getCurrentDateTime = () => {
    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getFullYear()).slice(-2)}-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return formattedDate;
};

const VisitLogForm: React.FC<{ username?: string }> = ({
    username: propUsername,
}) => {
    const [formData, setFormData] = useState({
        priority: 'Immediate', // Default value, { value: 'Immediate', label: 'E' },
        location: 'Road',
        age: '',
        conscious: 'Yes',
        breathing: 'Yes',
        chiefComplaint: 'Difficulty Breathing',
        condition: '',
        drugs: '',
        allergies: ''
    });

    // Set the visit time to the current date and time
    const [visitTime, setVisitTime] = useState(getCurrentDateTime());
    const [incidentId, setIncidentId] = useState('');
    
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>,
        child?: React.ReactNode
    ) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const role = localStorage.getItem('role')
    // If the Visit is created by a First Responder, the Incident ID* is added and the default Location is Road
    // If the Visit is created by a Nurse, the default Location is ER
    const checkRole = () => {
        if (role === 'Fire' || role === 'Police' || role === 'Administrator') {
            const incidentId = (JSON.parse(localStorage.getItem('incidentState') || '{}')?.incident?.incidentId) || '';
            setIncidentId(incidentId);
            // Set the location to Road, if the role is First Responder
            setFormData((prev) => ({
                ...prev,
                location: 'Road',
            }));
            // Set patient data if available
            // This is to get the patient data from the incident
            setPatientData();
        } else if (role === 'Nurse') {
            // Set the location to ER, if the role is Nurse
            setFormData((prev) => ({
                ...prev,
                location: 'ER',
            }));
        }
    }

    // Pulls Age, Conscious, Breathing, and Chief Complaint from the Incident if available
    const setPatientData = () => {
        const incident = JSON.parse(localStorage.getItem('incidentState') || '{}')?.incident;
        if (incident && incident.questions && incident.questions.length > 0) {
            for (const question of incident.questions) {
                if (question.isPatient && question.username === propUsername) {
                    setFormData((prev) => ({
                        ...prev,
                        // Only update age if it exists and can be converted to a string
                        age: question.age !== undefined ? question.age.toString() : prev.age,
                        // Only update conscious if it exists and is not empty
                        conscious: question.conscious ? question.conscious : prev.conscious,
                        // Only update breathing if it exists and is not empty
                        breathing: question.breathing ? question.breathing : prev.breathing,
                        // Only update chiefComplaint if it exists and is not empty
                        chiefComplaint: question.chiefComplaint ? question.chiefComplaint : prev.chiefComplaint,
                    }));
                    break;
                }
            }
        }    
    }

    // Update the form data when 
    
    // Check the role when the component mounts
    React.useEffect(() => {
        // Set the visit time to the current date and time
        setVisitTime(getCurrentDateTime());
        // Check the role and set the incident ID if needed
        checkRole();
    }
    , []);

    const { loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    if (loading) return <Loading />

    return (
        <Box
            width="100%"
            maxWidth="800px"
            my={4}
            display="flex"
            flexDirection="column"
            paddingX="32px"
            gap={3}  // Added vertical spacing between form elements
        >
            <Typography variant="h6">Visit: {visitTime}</Typography>
            <Typography variant="h6">Incident ID: {incidentId}</Typography>

            {/* Priority */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Priority:</Typography>
                    <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        sx={{ 
                            width: 200,
                            height: 40,
                            '& .MuiSelect-select': { 
                                padding: '8px 14px',
                            }
                        }}
                    >
                        {priorities.map((priority) => (
                            <MenuItem key={priority.value} value={priority.value}>
                                {priority.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </FormControl>

            {/* Location */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Location:</Typography>
                    <RadioGroup
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        row
                        sx={{ gap: 2 }}
                    >
                        {locations.map((location) => (
                            <FormControlLabel
                                key={location.value}
                                value={location.value}
                                control={<Radio />}
                                label={location.label}
                                sx={{ marginRight: 3 }}
                            />
                        ))}
                    </RadioGroup>
                </Box>
            </FormControl>

            {/* Age */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Age:</Typography>
                    <Box display="flex" alignItems="center">
                        <IconButton 
                            onClick={() => {
                                const newValue = formData.age === '' ? 0 : Math.max(0, parseInt(formData.age) - 1);
                                setFormData(prev => ({ ...prev, age: newValue.toString() }));
                            }} 
                            size="small"
                        >
                            <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                            variant="outlined"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            type="number"
                            inputProps={{ min: 0 }}
                            sx={{ width: 100, mx: 1 }}
                            size="small"
                        />
                        <IconButton 
                            onClick={() => {
                                const newValue = formData.age === '' ? 1 : parseInt(formData.age) + 1;
                                setFormData(prev => ({ ...prev, age: newValue.toString() }));
                            }} 
                            size="small"
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </FormControl>

            {/* Conscious */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Conscious:</Typography>
                    <RadioGroup
                        name="conscious"
                        value={formData.conscious}
                        onChange={handleChange}
                        row
                        sx={{ gap: 2 }}
                    >
                        <FormControlLabel
                            value="Yes"
                            control={<Radio />}
                            label="Yes"
                            sx={{ marginRight: 3 }}
                        />
                        <FormControlLabel
                            value="No"
                            control={<Radio />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>
            </FormControl>

            {/* Breathing */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Breathing:</Typography>
                    <RadioGroup
                        name="breathing"
                        value={formData.breathing}
                        onChange={handleChange}
                        row
                        sx={{ gap: 2 }}
                    >
                        <FormControlLabel
                            value="Yes"
                            control={<Radio />}
                            label="Yes"
                            sx={{ marginRight: 3 }}
                        />
                        <FormControlLabel
                            value="No"
                            control={<Radio />}
                            label="No"
                        />
                    </RadioGroup>
                </Box>
            </FormControl>

            {/* Chief Complaint */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Chief Complaint:</Typography>
                    <TextField
                        variant="outlined"
                        name="chiefComplaint"
                        value={formData.chiefComplaint}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />
                </Box>
            </FormControl>

            {/* Condition */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Condition:</Typography>
                    <Select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        sx={{ 
                            width: 200,
                            height: 40,
                            '& .MuiSelect-select': { 
                                padding: '8px 14px',
                            }
                        }}
                    >
                        {conditions.map((condition) => (
                            <MenuItem key={condition.value} value={condition.value}>
                                {condition.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </FormControl>

            {/* Drugs */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Drugs:</Typography>
                    <TextField
                        variant="outlined"
                        name="drugs"
                        value={formData.drugs}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />
                </Box>
            </FormControl>

            {/* Allergies */}
            <FormControl>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ width: 120, flexShrink: 0 }}>Allergies:</Typography>
                    <TextField
                        variant="outlined"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />
                </Box>
            </FormControl>
        </Box>
    )
}

export default VisitLogForm
