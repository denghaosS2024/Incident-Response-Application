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

  /// Renders the correct form based on the type obtained from step 2
  const renderForm = () => {
    switch (type) {
      case IncidentType.Medical:
        return (
          <MedicalForm isCreatedByFirstResponder={isCreatedByFirstResponder} />
        )
      case IncidentType.Fire:
        return <FireForm></FireForm>
      case IncidentType.Police:
        return <PoliceForm></PoliceForm>
      default:
        return (
          <>
            <MedicalForm
              isCreatedByFirstResponder={isCreatedByFirstResponder}
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
