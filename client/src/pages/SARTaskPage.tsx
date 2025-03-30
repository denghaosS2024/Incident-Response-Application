import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import request, {IRequestError} from '../utils/request'
import styles from '../styles/SARTaskPage.module.css'
import ClickableStepper, {StepIconStyle} from '../components/ClickableStepper'
import SARTaskStep1 from '../components/feature/SARTask/SARTaskStep1.tsx'
import SARTaskStep2 from '../components/feature/SARTask/SARTaskStep2.tsx'
import SARTaskStep3 from '../components/feature/SARTask/SARTaskStep3.tsx'
import SARTaskStep4 from '../components/feature/SARTask/SARTaskStep4.tsx'
import IIncident from '../models/Incident.ts'


const SARTaskPage: React.FC = () => {
  const {incidentId: incidentId} = useParams<{ incidentId: string }>()
  const [activeStep, setActiveStep] = useState<number>(0)
  const [currentIncident, setCurrentIncident] = useState<IIncident | null>(null)

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response: IIncident = await request(`/api/incidents?incidentId=${incidentId}`, {
          method: 'GET',
        })
        setCurrentIncident(response)
        // console.log(`Fetch Incident: ${JSON.stringify(response)}`)
      } catch (error) {
        const err = error as IRequestError
        alert(`Error when fetching incidentId=${incidentId}.\nError: ${err.message}`)
      }
    }
    fetchIncident().then()
  }, [incidentId])

  const contents = [
    <SARTaskStep1 />,
    <SARTaskStep2 />,
    <SARTaskStep3 />,
    <SARTaskStep4 />,
  ]

  const handleStepChange = (step: number): void => {
    if (step < contents.length) {
      setActiveStep(step)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div style={{pointerEvents: 'auto'}}>
        <ClickableStepper
          numberOfSteps={contents.length}
          activeStep={activeStep}
          setActiveStep={handleStepChange}
          contents={contents}
          stepIconStyle={StepIconStyle.Square}
        />
      </div>
    </div>
  )
}

export default SARTaskPage
