import React from 'react'
import MedicalForm from './MedicalForm';
import { RootState } from '../../utils/types';
import { useSelector } from 'react-redux';
import FireForm from './FireForm';
import PoliceForm from './PoliceForm';
import { IncidentType } from '../../models/Incident';

interface Reach911Step3Props {
    isCreatedByFirstResponder?: boolean;
  }

const Step3Form: React.FC<Reach911Step3Props> = ({ isCreatedByFirstResponder }) => {

    const type = useSelector((state: RootState) => state.incidentState.incident.type)

    const renderForm = () => {
        switch(type){
            case IncidentType.Medical:
                return <MedicalForm isCreatedByFirstResponder={isCreatedByFirstResponder} />;
            case IncidentType.Fire:
                return <FireForm></FireForm>
            case IncidentType.Police:
                return <PoliceForm></PoliceForm>
            default:
                return (
                    <>
                        <MedicalForm isCreatedByFirstResponder={isCreatedByFirstResponder} />
                        <FireForm></FireForm>
                        <PoliceForm></PoliceForm>
                    </>
                )
        }
    }

    return (
        <>
            {renderForm()}
        </>
    )
}

export default Step3Form
