import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import ClickableStepper from '../components/ClickableStepper'
import styles from '../styles/Reach911Page.module.css'
import { Box, Typography } from '@mui/material'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import IIncident from '../models/Incident'
import { updateIncident } from '../redux/incidentSlice'
import { AppDispatch, RootState } from '../redux/store'
import request from '../utils/request'

// Import the SAR step components
import SARStep1 from '../components/feature/SAR/SARStep1'
import SARStep2 from '../components/feature/SAR/SARStep2'
import SARStep3 from '../components/feature/SAR/SARStep3'
import SARStep4 from '../components/feature/SAR/SARStep4'
import SARStep5 from '../components/feature/SAR/SARStep5'

const SARIncidentPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    // Always start at Step 1 (index 0)
    const [activeStep, setActiveStep] = useState<number>(0)
    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    const [error, setError] = useState<string | null>(null)

    const location = useLocation()
    const {
        incidentId,
        isCreatedByFirstResponder,
        autoPopulateData,
        readOnly,
    } = location.state || {}
    // const role = localStorage.getItem('role') // Commented out as it's not used currently

    useEffect(() => {
        const initializeIncident = async () => {
            try {
                const username = localStorage.getItem('username')
                const token = localStorage.getItem('token')
                const uid = localStorage.getItem('uid')

                if (!username || !uid) {
                    setError('No username or uid found')
                    return
                }

                if (incidentId || isCreatedByFirstResponder) {
                    return
                }

                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/incidents/${username}/active`,
                    {
                        headers: {
                            'x-application-token': token || '',
                            'x-application-uid': uid || '',
                        },
                    },
                )
                if (response.status === 404) {
                    console.log('Creating new SAR incident')
                    let sarCount = 1
                try {
                    const sarResponse = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/incidents/sar?owner=${username}`,
                        {
                            headers: {
                                'x-application-token': token || '',
                                'x-application-uid': uid || '',
                            },
                        }
                    )
                    
                    console.log('SAR count response:', sarResponse);
                    
                    if (sarResponse.status === 204) {
                        console.log('No SAR incidents found, using count 1');
                        sarCount = 1;
                    } else if (sarResponse.ok) {
                        try {
                            const sarData = await sarResponse.json();
                            sarCount = (Array.isArray(sarData) ? sarData.length : 0) + 1;
                            console.log('Found SAR incidents, new count:', sarCount);
                        } catch (jsonError) {
                            console.log('Error parsing JSON response, using default count');
                            sarCount = 1;
                        }
                    } else {
                        console.log(`Error response: ${sarResponse.status}, using default count`);
                        sarCount = 1;
                    }
                } catch (countError) {
                    console.error('Error getting SAR incidents, using default count:', countError);
                    sarCount = 1;
                }


                    const sarIncidentId = `S${username}${sarCount}`



                    const createResponse = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/incidents/new`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-application-token': token || '',
                                'x-application-uid': uid || '',
                            },
                            body: JSON.stringify({
                                incidentId: sarIncidentId,
                                caller: username,
                                owner: username,
                                incidentState: 'Waiting',
                                openingDate: new Date().toISOString(),
                                commander: 'System',
                                type: 'S', // SAR incident type
                            }),
                        },
                    )

                    if (!createResponse.ok) {
                        throw new Error(
                            `Failed to create SAR incident: ${createResponse.status}`,
                        )
                    }

                    const newIncident = await createResponse.json()
                    dispatch(updateIncident(newIncident))
                    console.log('Created new SAR incident:', newIncident._id)
                    return
                }

                if (!response.ok) {
                    throw new Error(
                        `Failed to check active incidents: ${response.status}`,
                    )
                }

                const activeIncident = await response.json()
                dispatch(updateIncident(activeIncident))
                console.log('Found active incident:', activeIncident._id)
            } catch (error) {
                console.error('Error initializing incident:', error)
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to initialize incident',
                )
            }
        }

        initializeIncident()
    }, [dispatch, incidentId, isCreatedByFirstResponder])

    useEffect(() => {
        if (!incident._id) return

        const timer = setTimeout(() => {
            updateIncidentCall()
        }, 3000) // Debounce time

        return () => clearTimeout(timer)
    }, [incident]) // Triggers on any incident data change

    // If the user is first responder and viewing an incident
    useEffect(() => {
        const fetchIncidentAndPopulate = async (id: string) => {
            try {
                const data = await request(`/api/incidents?incidentId=${id}`)
                if (Array.isArray(data) && data.length > 0) {
                    const fetchedIncident = data[0]
                    dispatch(updateIncident(fetchedIncident))
                } else {
                    console.error('No incident found for incidentId:', id)
                }
            } catch (err) {
                console.error('Error fetching incident details:', err)
            }
        }
        console.log(
            'SAR Incident Id and autoPopulateData values:',
            incidentId,
            autoPopulateData,
        )
        if (autoPopulateData && incidentId) {
            fetchIncidentAndPopulate(incidentId)
        }
    }, [autoPopulateData, incidentId, dispatch])

    // Save step to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('SARStep', activeStep.toString())
    }, [activeStep])

    const contents = [
        <SARStep1
            autoPopulateData={autoPopulateData}
            isCreatedByFirstResponder={isCreatedByFirstResponder}
            incidentId={incidentId}
        />,
        <SARStep2 />,
        <SARStep3 />,
        <SARStep4 />,
        <SARStep5 incidentId={incidentId} />,
    ]

    const updateIncidentCall = async () => {
        try {
            const token = localStorage.getItem('token')
            const uid = localStorage.getItem('uid')

            if (!token || !uid || !incident._id) {
                setError(
                    'Authentication error: Missing token, UID, or incident ID.',
                )
                return
            }

            const url = `${import.meta.env.VITE_BACKEND_URL}/api/incidents/update`
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-application-token': token,
                    'x-application-uid': uid,
                },
                body: JSON.stringify({
                    ...incident,
                    incidentState: incident.incidentState || 'Waiting',
                    openingDate:
                        incident.openingDate || new Date().toISOString(),
                    owner: incident.owner || localStorage.getItem('username'),
                    commander: incident.commander || 'System',
                    caller: incident.caller || localStorage.getItem('username'),
                    type: incident.type || 'S', // Ensure SAR type is set
                }),
            })

            if (response.status !== 204) {
                const errorText = await response.text()
                throw new Error(`Update failed: ${errorText}`)
            }

            console.log('SAR Incident successfully updated.')
        } catch (error) {
            console.error('Error updating SAR incident:', error)

            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = String(error.message)
                console.error('Error details:', errorMessage)
                setError(errorMessage)
            } else {
                setError('An unknown error occurred')
            }
        }
    }

    const handleNextStep = (): void => {
        if (activeStep < contents.length - 1) {
            setActiveStep(activeStep + 1)
            setError(null)
            
            // Update incident when moving to final step
            if (activeStep === contents.length - 2) {
                updateIncidentCall()
            }
        }
    }

    // Allow navigation to any step in the stepper
    const handleStepChange = (step: number): void => {
        if (step < contents.length) {
            setActiveStep(step)
            setError(null)
        }
    }

    const lockedContents = contents.map((content, index) =>
        readOnly ? (
            <div key={index} style={{ pointerEvents: 'none' }}>
                {content}
            </div>
        ) : (
            content
        ),
    )

    return (
        <div className={styles.wrapper}>
            {error && (
                <Typography color="error" align="center" gutterBottom>
                    {error}
                </Typography>
            )}
            <ClickableStepper
                numberOfSteps={contents.length}
                activeStep={activeStep}
                setActiveStep={handleStepChange}
                contents={lockedContents}
            />

            <Box className={styles.buttonWrapper} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(activeStep - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={activeStep === contents.length - 1}
                    onClick={handleNextStep}
                >
                    Next
                </Button>
            </Box>
        </div>
    )
}

export default SARIncidentPage
