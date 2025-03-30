import { Step, StepLabel, Stepper } from '@mui/material'
import React from 'react'
import SquareStepIconComponent from './SquareStepIconComponent.tsx'


enum StepIconStyle {
  Round = 'Round',
  Square = 'Square'
}

interface IClickableStepperProps {
  numberOfSteps: number
  activeStep: number
  setActiveStep: (step: number) => void
  contents: JSX.Element[]
  stepIconStyle?: StepIconStyle
}

const ClickableStepper: React.FC<IClickableStepperProps> = ({
  numberOfSteps,
  activeStep,
  setActiveStep,
  contents,
  stepIconStyle = StepIconStyle.Round,
}) => {
  const handleStepClick = (index: number) => {
    setActiveStep(index)
  }

  return (
    <>
      <Stepper activeStep={activeStep} alternativeLabel nonLinear>
        {Array.from({ length: numberOfSteps }).map((_, index) => (
          <Step key={index} onClick={() => handleStepClick(index)}>
            {stepIconStyle === StepIconStyle.Square ? (
              <StepLabel StepIconComponent={SquareStepIconComponent} />
            ) : (
              // Round
              <StepLabel />
            )}
          </Step>
        ))}
      </Stepper>
      <div>{contents[activeStep]}</div>
    </>
  )
}

export default ClickableStepper
export { StepIconStyle }
