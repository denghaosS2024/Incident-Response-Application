import IHospital from '@/models/Hospital'
import request from '@/utils/request'
import { IVisitLogForm } from './IVisitLogForm'

export default class VisitLogHelper {
  static readonly priorities = Object.values(['E', '1', '2', '3', '4']).map(
    (value) => ({ value, label: value }),
  )

  static readonly locations = Object.values(['Road', 'ER']).map((value) => ({
    value,
    label: value,
  }))

  static async saveFormData(
    formData: IVisitLogForm,
    incidentId: string,
    visitTime: string,
    patientId: string,
  ) {
    // Post the form data to the server
    console.log([
      {
        ...formData,
        incidentId: incidentId,
        dateTime: visitTime,
      },
    ])
    const message = await request('/api/patients/visitLogs', {
      method: 'POST',
      body: JSON.stringify({
        patientId: patientId,
        visitLog: {
          ...formData,
          incidentId: incidentId,
          dateTime: visitTime,
        },
      }),
    })

    if (message) {
      alert('Form data saved successfully')
    } else {
      alert('Form data not saved')
    }
  }

  static async getHospitalByUserId(userId: string) {
    const res = await fetch(`/api/users/${userId}`)
    const user = await res.json()

    const hospitalId = user.hospitalId

    const hospital: IHospital = await (
      await fetch(`/api/hospital?hospitalId=${hospitalId}`)
    ).json()

    return hospital
  }

  static readonly conditions = Object.values([
    'Allergy',
    'Asthma',
    'Bleeding',
    'Broken bone',
    'Burn',
    'Choking',
    'Concussion',
    'Covid-19',
    'Heart Attack',
    'Heat Stroke',
    'Hypothermia',
    'Poisoning',
    'Seizure',
    'Shock',
    'Strain',
    'Sprain',
    'Stroke',
  ]).map((value) => ({
    value,
    label: value,
  }))
}
