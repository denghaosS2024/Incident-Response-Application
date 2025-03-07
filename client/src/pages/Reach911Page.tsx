import ClickableStepper from '../components/ClickableStepper'
import React, { useState, useEffect } from 'react'
import styles from '../styles/Reach911Page.module.css'
import Button from '@mui/material/Button';
import Step3Form from '../components/Reach911/Reach911Step3Form';
import Reach911Step1 from '../components/Reach911/Reach911Step1';
import Reach911Step2 from '../components/Reach911/Reach911Step2';
import Reach911Step4 from '../components/Reach911/Reach911Step4';
import { useDispatch, useSelector } from 'react-redux';
import { MedicalQuestions, RootState } from '../utils/types';
import IIncident, { IncidentType, IncidentPriority } from '../models/Incident';
import request from '../utils/request';
import { updateIncident } from '../features/incidentSlice';
import { AppDispatch } from '../app/store';

const Reach911Page: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [activeStep, setActiveStep] = useState<number>(0)
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)
    const [error, setError] = useState<string | null>(null);

    // Get the current user's username when component mounts
    useEffect(() => {
        const username = localStorage.getItem('username');
        const uid = localStorage.getItem('uid');
        if (username && uid) {
            dispatch(updateIncident({
                ...incident,
                caller: username // Store username in the caller field
            }));
        }
    }, [dispatch]);

    const contents = [
        <Reach911Step1 />,
        <Reach911Step2 />,
        <Step3Form />,
        <Reach911Step4 />,
    ];

    // Function for submitting incident
    const submitIncident = async () => {
        try {
            setError(null);

            const username = localStorage.getItem('username');
            const token = localStorage.getItem('token');
            const uid = localStorage.getItem('uid');

            if (!username || !uid) {
                setError('No username or uid found');
                console.error('No username or uid found');
                return;
            }

            // The backend expects an incident field
            const requestBody = {
                ...incident,
                caller: username,
                owner: username,
            };

            // Construct the URL and options 
            console.log('requestBody:', requestBody);
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/incidents/new`;
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-application-token': token || '',
                    'x-application-uid': uid || '',
                },
                body: JSON.stringify(requestBody)
            };

            // Use fetch directly
            const response = await fetch(url, options);

            // Parse the response body
            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse response as JSON:", e);
                throw new Error("Failed to parse response as JSON");
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: responseData.message || 'Failed to submit incident'
                };
            }

            // Move to next step
            setActiveStep(prev => prev + 1);
        } catch (error) {
            console.error('Error submitting incident:', error);
            // Add more detailed error logging
            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = String(error.message);
                console.error('Error details:', errorMessage);
                setError(errorMessage);
            } else {
                setError('An unknown error occurred');
            }
        }
    }

    const handleNextStep = (): void => {
        if (activeStep === contents.length - 2) {
            submitIncident();
        } else if (activeStep < contents.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div>
                <ClickableStepper numberOfSteps={contents.length} activeStep={activeStep} setActiveStep={setActiveStep} contents={contents} />
            </div>
            <div className={styles.placeholder}>
                {error && (
                    <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
                        Error: {error}
                    </div>
                )}
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
