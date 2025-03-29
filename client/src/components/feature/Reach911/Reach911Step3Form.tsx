import AddIcon from '@mui/icons-material/Add'
import React from 'react'
import { useSelector } from 'react-redux'
import { IncidentType } from '../../../models/Incident'
import { RootState } from '../../../redux/store'
import FireForm from './FireForm'
import MedicalForm from './MedicalForm'
import PoliceForm from './PoliceForm'

interface Reach911Step3Props {
    isCreatedByFirstResponder?: boolean
}

const Step3Form: React.FC<Reach911Step3Props> = ({
    isCreatedByFirstResponder,
}) => {
    const type = useSelector(
        (state: RootState) => state.incidentState.incident.type,
    )
    const [additionalForms, setAdditionalForms] = React.useState<number[]>([])
    const addMedicalForm = () => {
        setAdditionalForms([...additionalForms, additionalForms.length + 1])
    }

    /// Renders the correct form based on the type obtained from step 2
    const renderForm = () => {
        switch (type) {
            case IncidentType.Medical:
                return (
                    <>
                        <MedicalForm
                            isCreatedByFirstResponder={
                                isCreatedByFirstResponder
                            }
                        />
                        <hr
                            style={{
                                margin: '20px 0',
                                border: '1px solid #000',
                            }}
                        />
                        {additionalForms.map((formId) => (
                            <React.Fragment key={formId}>
                                <MedicalForm
                                    isCreatedByFirstResponder={
                                        isCreatedByFirstResponder
                                    }
                                />
                                <hr
                                    style={{
                                        margin: '20px 0',
                                        border: '1px solid #000',
                                    }}
                                />
                            </React.Fragment>
                        ))}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <AddIcon
                                onClick={addMedicalForm}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </>
                )
            case IncidentType.Fire:
                return <FireForm></FireForm>
            case IncidentType.Police:
                return <PoliceForm></PoliceForm>
            default:
                return (
                    <>
                        <MedicalForm
                            isCreatedByFirstResponder={
                                isCreatedByFirstResponder
                            }
                        />
                        <FireForm></FireForm>
                        <PoliceForm></PoliceForm>
                    </>
                )
        }
    }

    return <>{renderForm()}</>
}

export default Step3Form
