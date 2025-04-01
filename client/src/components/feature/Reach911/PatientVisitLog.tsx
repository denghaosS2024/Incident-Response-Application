import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import PatientHelper from './PatientHelper'
/**
 * The visit log of a patient
 * TODO: Move this to a types folder
 */
export interface IVisitLog {
    dateTime: Date
    incidentId: string
    priority: 'E' | '1' | '2' | '3' | '4'
    location: 'Road' | 'ER'
    age?: number | null
    conscious?: 'Yes' | 'No' | null
    breathing?: 'Yes' | 'No' | null
    chiefComplaint?: string | null
    condition?:
        | 'Allergy'
        | 'Asthma'
        | 'Bleeding'
        | 'Broken bone'
        | 'Burn'
        | 'Choking'
        | 'Concussion'
        | 'Covid-19'
        | 'Heart Attack'
        | 'Heat Stroke'
        | 'Hypothermia'
        | 'Poisoning'
        | 'Seizure'
        | 'Shock'
        | 'Strain'
        | 'Sprain'
        | 'Stroke'
        | 'Others'
        | null
    drugs?: string[] | null
    allergies?: string[] | null
    active: boolean
}

export default function PatientVisitLog({
    patientId,
}: {
    patientId: string | undefined
}) {
    const [visitLog, setVisitLog] = useState<IVisitLog[]>([])

    useEffect(() => {
        if (patientId) {
            PatientHelper.getPatientInfo(patientId ?? '').then((patient) => {
                setVisitLog(patient.visitLog)
            })
        }
    }, [patientId])

    return (
        <div className="flex justify-center">
            <table className="table-auto w-full">
                <thead>
                    <tr className="bg-gray-300">
                        <th className="text-start p-2">Date</th>
                        <th className="text-start p-2 ">Location</th>
                        <th className="text-end p-2">Link</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(visitLog).map((entry) => (
                        <tr key={uuidv4()} className="odd:bg-gray-100">
                            <td className="text-start p-2 ">
                                {PatientHelper.timeString(entry.dateTime)}
                            </td>
                            <td className="text-start p-2 ">
                                {entry.location ?? ''}
                            </td>
                            <td className="text-end p-2">
                                {/* N/A for now, TODO: Find out what is going on with this field */}
                                N/A
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
