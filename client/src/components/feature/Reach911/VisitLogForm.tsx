import { Box, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
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

const VisitLogForm: React.FC<{ username?: string }> = ({
    username: propUsername,
}) => {
    const [formData, setFormData] = useState({
        priority: 'Immediate', // Default value
        location: 'Road',
        age: '',
        conscious: 'Yes',
        breathing: 'Yes',
        chiefComplaint: 'Difficulty Breathing',
        condition: '',
        drugs: '',
        allergies: ''
    });
    
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

    const { loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    if (loading) return <Loading />

    return (
        <>
            <Box
                width="100%"
                maxWidth="800px"
                my={4}
                display="flex"
                flexDirection="column"
                alignItems="left"
                paddingX="32px"
            >
                <Typography>Visit: 12.03.21-10:00</Typography>
                <Typography>Incident ID: IZoe</Typography>
                <FormControl>
                    <Typography>Priority: </Typography>
                    <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        {
                            priorities.map((priority) => (
                                <MenuItem key={priority.value} value={priority.value}>
                                    {priority.label}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <FormControl>
                    <Typography>Location: </Typography>
                    <RadioGroup
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        row
                    >
                        {locations.map((location) => (
                            <FormControlLabel
                                key={location.value}
                                value={location.value}
                                control={<Radio />}
                                label={location.label}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <Typography>Age: </Typography>
                    <TextField
                        variant="outlined"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        type="number"
                        inputProps={{ min: 0 }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Concious</FormLabel>
                    <RadioGroup
                        name="conscious"
                        value={formData.conscious}
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value="Yes"
                            control={<Radio />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="No"
                            control={<Radio />}
                            label="No"
                        />
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <FormLabel>Breathing</FormLabel>
                    <RadioGroup
                        name="breathing"
                        value={formData.breathing}
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value="Yes"
                            control={<Radio />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value="No"
                            control={<Radio />}
                            label="No"
                        />
                    </RadioGroup>
                </FormControl>
                <FormControl>
                    <Typography>Chief Complaint: </Typography>
                    <TextField
                        variant="outlined"
                        name="chiefComplaint"
                        value={formData.chiefComplaint}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <Typography>Condition: </Typography>
                    <Select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                    >
                        {
                            conditions.map((condition) => (
                                <MenuItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <FormControl>
                    <Typography>Drugs: </Typography>
                    <TextField
                        variant="outlined"
                        name="drugs"
                        value={formData.drugs}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <Typography>Allergies: </Typography>
                    <TextField
                        variant="outlined"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                    />
                </FormControl>
            </Box>
        </>
    )
}

export default VisitLogForm
