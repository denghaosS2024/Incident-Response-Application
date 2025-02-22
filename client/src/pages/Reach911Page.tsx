import ClickableStepper from '../components/ClickableStepper'
import React, { useState, } from 'react'
import styles from '../styles/Reach911Page.module.css'
import Button from '@mui/material/Button';

const Reach911Page: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const contents = ["911 Step 1", "911 Step 2", "911 Step 3", "911 Step 4"];

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
