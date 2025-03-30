import React from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import { useCurrentDateTime } from './useCurrentDateTime.tsx'

const SARTaskStep1: React.FC = () => {
  const { formattedDateTime } = useCurrentDateTime()
  const incidentId = 'SDena101' //todo

  const leftText = formattedDateTime 
    ? `${incidentId} ${formattedDateTime}`
    : 'SDena101 04.04.21 1:40pm'

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
