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
import MedicalForm from './MedicalForm';
import FireForm from './FireForm';

export interface IProps {
    /**
     * Function to call when the form is submitted
     */
    formData: IIncident
    onChange: (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
}

const Step3Form: React.FC<IProps> = ({ formData, onChange }) => {

    const type: string = formData.type
    const renderForm = () => {
        switch(type){
            case "Medical":
                return <MedicalForm formData={formData} onChange={onChange}></MedicalForm>
            case "Fire":
                return <FireForm formData={formData} onChange={onChange}></FireForm>
            default:
                return <MedicalForm formData={formData} onChange={onChange}></MedicalForm>
        }
    }

    return (
        <>
            {renderForm()}
        </>
    )
}

export default Step3Form
