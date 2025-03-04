import React from 'react'
import MedicalForm from './MedicalForm';
import { RootState } from '../../utils/types';
import { useSelector } from 'react-redux';
import FireForm from './FireForm';
import PoliceForm from './PoliceForm';

const Step3Form: React.FC = () => {

    const type: string = useSelector((state: RootState) => state.incidentState.incident.type)

    const renderForm = () => {
        switch(type){
            case "Medical":
                return <MedicalForm></MedicalForm>
            case "Fire":
                return <FireForm></FireForm>
            case "Police":
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
