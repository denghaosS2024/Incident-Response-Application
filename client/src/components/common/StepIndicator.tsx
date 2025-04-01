import React from 'react'

interface StepIndicatorProps {
    currentStep: number
    totalSteps: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps,
}) => {
    const positionPercentage =
        totalSteps === 1 ? 50 : (currentStep - 1) * (100 / (totalSteps - 1))

    return (
        <div className="relative w-full h-6 flex items-center mb-2">
            <div className="w-full h-0.5 bg-gray-400"></div>
            <div
                className="absolute w-6 h-6 rounded-full bg-gray-300 border border-gray-500 flex items-center justify-center text-sm font-semibold"
                style={{
                    left: `${positionPercentage}%`,
                    transform: 'translate(-50%, -50%)',
                    top: '50%',
                }}
            >
                {currentStep}
            </div>
        </div>
    )
}

export default StepIndicator
