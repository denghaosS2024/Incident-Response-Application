import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import ClickableStepper from '../components/ClickableStepper'
import styles from '../styles/Reach911Page.module.css'

import Reach911Step1 from '../components/Reach911/Reach911Step1'
import Reach911Step2 from '../components/Reach911/Reach911Step2'
import Reach911Step3 from '../components/Reach911/Reach911Step3Form'
import Reach911Step4 from '../components/Reach911/Reach911Step4'
import Reach911Step5 from '../components/Reach911/Reach911Step5'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import IIncident from '../models/Incident'
import { updateIncident } from '../redux/incidentSlice'
import { AppDispatch, RootState } from '../redux/store'
import request from '../utils/request'

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
  const { incidentId, isCreatedByFirstResponder, autoPopulateData, readOnly } =
    location.state || {}
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
      'Incident Id are autoPopulateData values are:{},{}',
      incidentId,
      autoPopulateData,
    )
    if (autoPopulateData && incidentId) {
      fetchIncidentAndPopulate(incidentId)
    }
  }, [autoPopulateData, incidentId, dispatch])

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('911Step', activeStep.toString())
  }, [activeStep])

  const contents = [
    <Reach911Step1
      autoPopulateData={autoPopulateData}
      isCreatedByFirstResponder={isCreatedByFirstResponder}
      incidentId={incidentId}
    />,
    <Reach911Step2 />,
    <Reach911Step3 isCreatedByFirstResponder={isCreatedByFirstResponder} />,
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
      const url = `${import.meta.env.VITE__BACKEND_URL}/api/incidents/new`
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

  const updateIncidentCall = async () => {
    try {
      const token = localStorage.getItem('token')
      const uid = localStorage.getItem('uid')

      if (!token || !uid) {
        setError('Authentication error: Missing token or UID.')
        console.error('Authentication error: Missing token or UID.')
        return
      }

      const cleanedIncident = { ...incident }
      if (!cleanedIncident._id) delete (cleanedIncident as any)._id
      if (!cleanedIncident.incidentCallGroup)
        delete (cleanedIncident as any).incidentCallGroup

      if (!cleanedIncident.openingDate)
        delete (cleanedIncident as any).openingDate
      if (!cleanedIncident.incidentState)
        delete (cleanedIncident as any).incidentState
      if (!cleanedIncident.owner) delete (cleanedIncident as any).owner
      if (!cleanedIncident.commander) delete (cleanedIncident as any).commander
      if (!cleanedIncident.caller) delete (cleanedIncident as any).caller

      const requestBody = {
        ...cleanedIncident,
        incidentId: incidentId,
      }

      const url = `${import.meta.env.VITE__BACKEND_URL}/api/incidents/update`
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-application-token': token,
          'x-application-uid': uid,
        },
        body: JSON.stringify(requestBody),
      }

      const response = await fetch(url, options)

      if (response.status !== 204) {
        throw new Error(`Unexpected response status: ${response.status}`)
      }

      console.log('Incident successfully updated.')
      // window.alert('Incident updated successfully')
    } catch (error) {
      console.error('Error updating incident:', error)

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
    const hasStep5 = contents.length === 5

    if (activeStep === 3 && hasStep5) {
      if (
        isCreatedByFirstResponder === true ||
        (autoPopulateData === true && readOnly === false)
      ) {
        updateIncidentCall()
      }

      setActiveStep(activeStep + 1)
      setError(null)
    } else if (activeStep === contents.length - 2) {
      if (
        isCreatedByFirstResponder === true ||
        (autoPopulateData === true && readOnly === false)
      ) {
        updateIncidentCall()
      } else {
        submitIncident()
      }
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
    <div
      className={styles.wrapper}
      style={
        readOnly
          ? { pointerEvents: 'none', position: 'relative', paddingTop: '50px' }
          : {}
      }
    >
      {readOnly && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            textAlign: 'center',
            zIndex: 1000,
          }}
        >
          This incident is in read-only mode.
        </div>
      )}
      <div style={readOnly ? { pointerEvents: 'auto' } : {}}>
        <ClickableStepper
          numberOfSteps={contents.length}
          activeStep={activeStep}
          setActiveStep={handleStepChange}
          contents={lockedContents}
        />
      </div>
      <div className={styles.placeholder}>
        {error && (
          <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
            Error: {error}
          </div>
        )}
      </div>
      {activeStep != lockedContents.length - 1 && (
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
