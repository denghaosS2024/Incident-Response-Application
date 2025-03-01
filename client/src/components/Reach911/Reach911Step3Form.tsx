import React from 'react'
import MedicalForm from './MedicalForm';
import { RootState } from '../../utils/types';
import { useSelector } from 'react-redux';

const Step3Form: React.FC = () => {

    const type: string = useSelector((state: RootState) => state.incidentState.incident.type)

    const renderForm = () => {
        // TODO add the other forms
        switch(type){
            case "Medical":
                return <MedicalForm></MedicalForm>
            case "Fire":
                return <MedicalForm></MedicalForm>
            default:
                return <MedicalForm></MedicalForm>
        }
    }

    return (
        <>
            {renderForm()}
        </>
    )
}

export default Step3Form
