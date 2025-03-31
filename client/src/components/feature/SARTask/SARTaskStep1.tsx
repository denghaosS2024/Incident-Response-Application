import React, { useEffect } from 'react'
import IIncident, {IncidentType} from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import formatDateTime from './useCurrentDateTime.tsx'
import request, {IRequestError} from '../../../utils/request.ts'

interface SARTaskStep1Props {
  incident: IIncident | null
  setIncident: (incident: IIncident) => void
}

const SARTaskStep1: React.FC<SARTaskStep1Props> = ({ incident, setIncident }) => {
  const startDate = (incident?.sarTask?.startDate) ? new Date(incident?.sarTask?.startDate) : new Date()
  const formattedDateTime = formatDateTime(startDate)
  const incidentId = incident?.incidentId || 'NullId101'

  const leftText = `${incidentId} ${formattedDateTime}`

  useEffect(() => {
    const updateSARTask = async () => {
      if (!incident) return
      try {
        const response: IIncident = await request(
          `/api/incidents/sar/${incident.incidentId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              sarTask: {
                state: 'InProgress',
                startDate: startDate.toISOString(),
                endDate: incident?.sarTask?.endDate,
                hazards: incident?.sarTask?.hazards || [],
                victims: incident?.sarTask?.victims || [0, 0, 0, 0, 0],
              }
            }),
          }
        )
        console.log('SAR task updated successfully:', JSON.stringify(response))
        setIncident(response)
      } catch (error) {
        const err = error as IRequestError
        console.error('Error updating SAR task:', err.message)
      }
    }

    if (incident?.type === IncidentType.Sar && incident?.sarTask?.state === 'Todo') {
      updateSARTask().then()
    }
  }, [incident])

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address={incident?.address || 'No Address'} />
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Initial Marker'}
        subtitle={'Draw this marker on the wall, next to the main entrance:'}
      />

      <div className={styles.flexCenter}>
        <FEMAMarker
          left={leftText}
          size={300}
        />
      </div>

      <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
        <ReturnToTasksBtn />
      </div>
    </div>
  )
}

export default SARTaskStep1
