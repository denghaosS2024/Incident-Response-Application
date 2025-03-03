import ClickableStepper from '../components/ClickableStepper'
import React, { useState, } from 'react'
import styles from '../styles/Reach911Page.module.css'
import Button from '@mui/material/Button';
import Step3Form from '../components/Reach911/Reach911Step3Form';
import Reach911Step1 from '../components/Reach911/Reach911Step1';
import Reach911Step4 from '../components/Reach911/Reach911Step4';
import { useDispatch, useSelector } from 'react-redux';
import { MedicalQuestions, RootState } from '../utils/types';
import IIncident from '../models/Incident';
import request from '../utils/request';
import { updateIncident } from '../features/incidentSlice';
import { AppDispatch } from '../app/store';

const Reach911Page: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [activeStep, setActiveStep] = useState<number>(0)
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)

    const contents = [
        <Reach911Step1 />,
        <Step3Form />,
        <Reach911Step4 />,
        // add the following steps here
    ];


    // Function for submitting incident
    const submitIncident = async () => {

        // marks the opening date of the incident as the submisison time
        const openingDate = new Date();

        dispatch(updateIncident({
            ...incident, // Keep other fields of incident unchanged
            openingDate: openingDate.toUTCString() 
        }));

        const message = await request(`/api/incidents`, {
            method: 'POST',
            body: JSON.stringify({
                incident,
            }),
        })
    }

    const handleNextStep = (): void => {
        if (activeStep < contents.length - 1) {
            setActiveStep(activeStep + 1);
        }

        if (activeStep === contents.length - 2) {
            submitIncident()
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
