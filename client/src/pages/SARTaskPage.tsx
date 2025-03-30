import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import request, { IRequestError } from '../utils/request'
import styles from '../styles/SARTaskPage.module.css'
import ClickableStepper, {StepIconStyle} from '../components/ClickableStepper'
import SARTaskStep1 from '../components/feature/SARTask/SARTaskStep1.tsx'
import SARTaskStep2 from '../components/feature/SARTask/SARTaskStep2.tsx'
import SARTaskStep3 from '../components/feature/SARTask/SARTaskStep3.tsx'
import SARTaskStep4 from '../components/feature/SARTask/SARTaskStep4.tsx'


const SARTaskPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0)

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
