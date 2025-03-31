import React from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import { useCurrentDateTime } from './useCurrentDateTime.tsx'

interface SARTaskStep1Props {
  incident?: IIncident | null;
}

const SARTaskStep1: React.FC<SARTaskStep1Props> = ({incident }) => {  const { formattedDateTime } = useCurrentDateTime()
  console.log(incident)
  const incidentId = Array.isArray(incident) 
    ? incident[0]?.incidentId || 'SDena101' 
    : incident?.incidentId || 'SDena101'
    
  let leftText = 'SDena101 04.04.21 1:40pm'
  // if (isReadOnly && incident?.tasks) {
  //     leftText = `${incidentId} ${formattedDate} ${formattedTime}`
  //   } // todo: get the date and time from the incident object
  // } else if (!isReadOnly && formattedDateTime) {
    leftText = `${incidentId} ${formattedDateTime}`
  // }

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
