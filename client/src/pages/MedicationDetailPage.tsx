import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import MedicationForm from '../components/MedicationForm'
import request from '../utils/request'

const MedicationDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { index } = useParams()
  const patientId = searchParams.get('patientId')
  const [medication, setMedication] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      const res = await request(`/api/patientPlan/${patientId}`)
      const med = res.medications[Number(index)]
      setMedication(med)
    }
    fetch()
  }, [index, patientId])

  if (!medication) return <div>Loading...</div>

  return (
    <MedicationForm
      data={medication}
      onSave={async (form) => {
        try {
          await request(`/api/patientPlan/${patientId}/medications/${index}`, {
            method: 'PUT',
            body: JSON.stringify(form),
          });
          window.location.href = `/patients/plan?patientId=${patientId}`;
        } catch (err) {
          console.error('Failed to update medication', err);
        }
      }}
    />
  );
  
}

export default MedicationDetailPage
