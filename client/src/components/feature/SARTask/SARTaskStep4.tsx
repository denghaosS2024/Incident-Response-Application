import { Button } from '@mui/material'
import React from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import formatDateTime from './useCurrentDateTime.tsx'

interface SARTaskStep4Props {
  incident?: IIncident | null;
}

const SARTaskStep4: React.FC<SARTaskStep4Props> = ({incident }) => {
    const currentIncident = Array.isArray(incident) ? incident[0] : incident;
    console.log('Current Incident:', currentIncident)
    const incidentId = currentIncident?.incidentId
    const now = new Date();
    const formattedDateTime = formatDateTime(now)
    const handleDoneClick = async () => {
          try {
            const token = localStorage.getItem('token')
            const uid = localStorage.getItem('uid')
            
            if (!token || !uid) {
              console.error('No authentication token or uid found')
              return
            }            
            const currentSarTask = currentIncident?.sarTask || {};
            
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/incidents/sar/${incidentId}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-application-token': token,
                  'x-application-uid': uid,
                },
                body: JSON.stringify({
                  sarTask: {
                    ...currentSarTask,
                    state: 'Done',
                    endDate: now.toISOString()
                  }
                }),
              }
            )
            
            if (!response.ok) {
              throw new Error(`Failed to update SAR task: ${response.status}`)
            }
            
            const updatedIncident = await response.json()
            alert('Task marked as done!')
            

          } catch (error) {
            console.error('Error updating SAR task:', error)
            alert('Failed to mark task as done. Please try again.')
          }
        }

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address='4400 Forbes Ave, Pittsburgh, PA 15213' /> {/*TODO: load address dynamically*/}
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Final Marker'}
        subtitle={'Update the marker on the wall, next to the main entrance:'}
      />

      <div className={styles.flexCenter}>
        <FEMAMarker
          top={formattedDateTime}
          right='[FAKE] Dogs Foods'
          bottom='[FAKE] 1-Immediate 2-Urgent'
          left='[FAKE] SDena101 04.04.21 1:40pm'
          size={300}
        />
      </div>

      <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
        <ReturnToTasksBtn />
        <Button className={styles.primaryBtn} onClick={handleDoneClick} variant="contained"
        sx={{ mt: 2, mx: 1 }}>
          Done
        </Button>
      </div>
    </div>
  )
}

export default SARTaskStep4
