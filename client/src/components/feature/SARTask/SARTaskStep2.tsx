import React from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'

interface SARTaskStep2Props {
  incident?: IIncident | null;
}

const SARTaskStep2: React.FC<SARTaskStep2Props> = ({incident }) => {
    const incidentId = Array.isArray(incident) 
    ? incident[0]?.incidentId || 'SDena101' 
    : incident?.incidentId || 'SDena101'
  // todo: readonly logic to determine if we should show the hazards based on the incident object
  return (
    <div className={styles.wrapperStep}>
      <AddressBar address='4400 Forbes Ave, Pittsburgh, PA 15213' /> {/*TODO: load address dynamically*/}
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Hazards'}
        subtitle={'Select the hazards you notice:'}
      />
      <ReturnToTasksBtn />
    </div>
  )
}

export default SARTaskStep2
