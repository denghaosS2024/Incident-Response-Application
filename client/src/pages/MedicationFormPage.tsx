import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MedicationForm from '../components/MedicationForm'
import request from "../utils/request";

const MedicationFormPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')
  const navigate = useNavigate()

  const handleSave = async (form: {
    name: string
    frequency: string
    time: string
    route: string
    notes: string
  }) => {
    try {
      await request(`/api/patientPlan/${patientId}/medications`, {
        method: 'POST',
        body: JSON.stringify(form),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      navigate(`/patients/plan?patientId=${patientId}`)
    } catch (error) {
      console.error('Failed to save medication:', error)
    }
  }

  return <MedicationForm onSave={handleSave} />
}

export default MedicationFormPage
