import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import ClickableStepper from '../components/ClickableStepper'
import Reach911Step1 from '../components/Reach911/Reach911Step1'
import Reach911Step2 from '../components/Reach911/Reach911Step2'
import Step3Form from '../components/Reach911/Reach911Step3Form'
import Reach911Step4 from '../components/Reach911/Reach911Step4'
import Reach911Step5 from '../components/Reach911/Reach911Step5'
import styles from '../styles/Reach911Page.module.css'
import Globals from '../utils/Globals'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { AppDispatch } from '../app/store'
import { updateIncident } from '../features/incidentSlice'
import IIncident from '../models/Incident'
import { RootState } from '../utils/types'

const Reach911Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  // Load saved step from localStorage or default to 0
  const [activeStep, setActiveStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('911Step')
    return savedStep ? parseInt(savedStep, 10) : 0
  })
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()
  const { incidentId, isCreatedByFirstResponder } = location.state || {}
  const role = localStorage.getItem('role')

  // Get the current user's username when component mounts
  useEffect(() => {
    const username = localStorage.getItem('username')
    const uid = localStorage.getItem('uid')
    if (username && uid) {
      dispatch(
        updateIncident({
          ...incident,
          caller: username, // Store username in the caller field
        }),
      )
    }
  }, [dispatch])

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('911Step', activeStep.toString())
  }, [activeStep])

  const contents = [
    <Reach911Step1 />,
    <Reach911Step2 />,
    <Step3Form />,
    <Reach911Step4 isCreatedByFirstResponder={isCreatedByFirstResponder} />,
  ]

  const isResponder =
    role === 'Fire' || role === 'Police' || role === 'Dispatch'
  if (isResponder) {
    contents.push(<Reach911Step5 incidentId={incidentId} />)
  }

  // Function for submitting incident
  const submitIncident = async () => {
    try {
      setError(null)

      const username = localStorage.getItem('username')
      const token = localStorage.getItem('token')
      const uid = localStorage.getItem('uid')

      if (!username || !uid) {
        setError('No username or uid found')
        console.error('No username or uid found')
        return
      }

      // The backend expects an incident field
      const requestBody = {
        ...incident,
        caller: username,
        owner: username,
      }

      // Construct the URL and options
      console.log('requestBody:', requestBody)
      const url = `${Globals.backendUrl()}/api/incidents/new`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-application-token': token || '',
          'x-application-uid': uid || '',
        },
        body: JSON.stringify(requestBody),
      }

      // Use fetch directly
      const response = await fetch(url, options)

      // Parse the response body
      const responseText = await response.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Failed to parse response as JSON')
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData.message || 'Failed to submit incident',
        }
      }

      // Move to next step
      setActiveStep(3)
      localStorage.setItem('911Step', '3')
    } catch (error) {
      console.error('Error submitting incident:', error)
      // Add more detailed error logging
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
    if (activeStep === contents.length - 2) {
      submitIncident()
    } else if (activeStep < contents.length - 1) {
      setActiveStep(activeStep + 1)
      setError(null)
    }
  }

  // Allow navigation to any step in the stepper
  const handleStepChange = (step: number): void => {
    if (step < contents.length) {
      setActiveStep(step)
      setError(null)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div>
        <ClickableStepper
          numberOfSteps={contents.length}
          activeStep={activeStep}
          setActiveStep={handleStepChange}
          contents={contents}
        />
      </div>
      <div className={styles.placeholder}>
        {error && (
          <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
            Error: {error}
          </div>
        )}
      </div>
      {activeStep != contents.length - 1 && (
        <div className={styles.buttonWrapper}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleNextStep}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default Reach911Page
