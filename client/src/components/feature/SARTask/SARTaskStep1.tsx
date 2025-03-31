import React, { useEffect } from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import formatDateTime from './useCurrentDateTime.tsx'

interface SARTaskStep1Props {
  incident?: IIncident | null;
}

const SARTaskStep1: React.FC<SARTaskStep1Props> = ({incident }) => {  
  console.log(incident)
  const now = new Date();
  
  const formattedDateTime = formatDateTime(now)
  const incidentId = Array.isArray(incident) 
    ? incident[0]?.incidentId || 'SDena101' 
    : incident?.incidentId || 'SDena101'
    
  const leftText = `${incidentId} ${formattedDateTime}`
  
  useEffect(() => {
    const updateSARTask = async () => {
      if (!incident) return
      
      try {
        const token = localStorage.getItem('token')
        const uid = localStorage.getItem('uid')
        
        if (!token || !uid) {
          console.error('No authentication token or uid found')
          return
        }
        
        
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
                state: 'InProgress',
                startDate: now.toISOString()
              }
            }),
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to update SAR task: ${response.status}`)
        }
        
        const updatedIncident = await response.json()
        console.log('SAR task updated successfully:', updatedIncident)
      } catch (error) {
        console.error('Error updating SAR task:', error)
      }
    }
    
    updateSARTask()
  }, [incident, incidentId, formattedDateTime])

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address='4400 Forbes Ave, Pittsburgh, PA 15213' /> {/*TODO: load address dynamically*/}
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

      <ReturnToTasksBtn />
    </div>
  )
}

export default SARTaskStep1
