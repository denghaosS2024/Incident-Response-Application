import ClickableStepper from '../components/ClickableStepper'
import React, { useState, } from 'react'
import styles from '../styles/Reach911Page.module.css'
import Button from '@mui/material/Button';
import Step3Form, { IProps } from '../components/Step3Form';
import IIncident from '../models/Incident';
import { SelectChangeEvent } from '@mui/material';
import { usePersistantState } from '../hooks/usePersistantState';


const Reach911Page: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(0);

    const [formData, setFormData] = usePersistantState("formData", {
        _id: '', // Unique identifier for the message
        caller: '', // User object representing the sender of the message
        timestamp: '', // Timestamp of when the message was sent
        state: '', // Identifier of the state of the incident
        owner: '', // The owner of the incident
        commander: '', // The commander of the incident
        address: '', // The address of the user
        type: '', // The type of the incident
        isPatient: false, // Whtehr or not he incident creator is the patient
        username: '', // The Username of the patient
        age: 0, // The age of the patient
        sex: '', // The sex of the patient
        conscious: '', // The conscious state of the patient
        breathing: '', // The breathing state of the patient
        chiefComplaint: '' // The chief complain of the patient
    });
    

    const handleChange = (field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { type, value, checked } = e.target as HTMLInputElement

        setFormData((prevData) => ({
            ...prevData,
            [field]: type === "checkbox" ? checked : value
        }));
    };

    const contents = [
        <Step3Form formData={formData} onChange={handleChange} />
    ];
    
    const handleNextStep = (): void => {
        if (activeStep < contents.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div>
                <ClickableStepper numberOfSteps={contents.length} activeStep={activeStep} setActiveStep={setActiveStep} contents={contents} />
            </div>
            <div className={styles.placeholder}>
            </div>
            <div className={styles.buttonWrapper}>
                <Button fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleNextStep}
                >
                    Next
                </Button>
            </div>
        </div >

    )
}

export default Reach911Page
