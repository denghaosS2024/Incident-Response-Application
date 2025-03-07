import React from 'react'
import MedicalForm from './MedicalForm';
import { RootState } from '../../utils/types';
import { useSelector } from 'react-redux';
import FireForm from './FireForm';
import PoliceForm from './PoliceForm';
import { IncidentType } from '../../models/Incident';

const Step3Form: React.FC = () => {

    const type = useSelector((state: RootState) => state.incidentState.incident.type)

    const renderForm = () => {
        switch(type){
            case IncidentType.Medical:
                return <MedicalForm></MedicalForm>
            case IncidentType.Fire:
                return <FireForm></FireForm>
            case IncidentType.Police:
                return <PoliceForm></PoliceForm>
            default:
                return (
                    <>
                        <MedicalForm></MedicalForm>
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
