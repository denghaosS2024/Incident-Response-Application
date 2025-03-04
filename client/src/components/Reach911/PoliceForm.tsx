import {
    Box,
    TextField,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    SelectChangeEvent,
} from '@mui/material'

import React, { useEffect } from 'react'
import IIncident from '../../models/Incident';
import { RootState, PoliceQuestions } from '../../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { updateIncident } from '../../features/incidentSlice';
import { loadContacts } from '../../features/contactSlice';
import { AppDispatch } from '../../app/store';

const FireForm: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)
    const policeQuestions = (incident.questions as PoliceQuestions) ?? {};

    const isSafe = policeQuestions.isSafe ?? "";
    const hasWeapons = policeQuestions.hasWeapons ?? "";
    const suspectDescription = policeQuestions.suspectDescription ?? "";
    const crimeDetails = policeQuestions.crimeDetails ?? "";


    useEffect(() => {
        dispatch(loadContacts())
    }, [dispatch])

    const onChange = (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { value } = e.target as HTMLInputElement;

        dispatch(updateIncident({
            ...incident,
            questions: {
                ...(incident.questions ?? {}),
                [field]: value
            } as PoliceQuestions
        }));

    };


    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                paddingX="32px"
            >

                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="isSafe-label">Are you safe?</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="isSafe-label"
                            name="isSafe-radio-buttons-group"
                            value={isSafe}
                            onChange={(e) => onChange("isSafe", e)}
                        >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <FormControl>
                        <FormLabel id="hasWeapons-label">Are there weapons involved?</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="hasWeapons-label"
                            name="hasWeapons-radio-buttons-group"
                            value={hasWeapons}
                            onChange={(e) => onChange("hasWeapons", e)}
                        >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Suspect Description"
                        fullWidth
                        multiline
                        value={suspectDescription}
                        onChange={(e) => onChange("suspectDescription", e)}
                    />
                </Box>

                <Box width="100%" maxWidth="500px" my={2}>
                    <TextField
                        variant="outlined"
                        label="Crime Details"
                        fullWidth
                        multiline
                        value={crimeDetails}
                        onChange={(e) => onChange("crimeDetails", e)}
                    />
                </Box>
            </Box>
        </>
    )
}

export default FireForm
