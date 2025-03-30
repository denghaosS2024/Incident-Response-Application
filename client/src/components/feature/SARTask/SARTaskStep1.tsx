import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import FEMAMarker from './FEMAMarker'


const SARTaskStep1: React.FC = () => {

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
          left='SDena101 04.04.21 1:40pm'
          size={300}
        />
      </div>

      <ReturnToTasksBtn />
    </div>
  )
}

export default SARTaskStep1
