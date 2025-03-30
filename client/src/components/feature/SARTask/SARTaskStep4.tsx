import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import FEMAMarker from './FEMAMarker'


const SARTaskStep4: React.FC = () => {

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
          top='[FAKE] 04.04.21 2:00pm'
          right='[FAKE] Dogs Foods'
          bottom='[FAKE] 1-Immediate 2-Urgent'
          left='[FAKE] SDena101 04.04.21 1:40pm'
          size={300}
        />
      </div>

      <ReturnToTasksBtn />
    </div>
  )
}

export default SARTaskStep4
