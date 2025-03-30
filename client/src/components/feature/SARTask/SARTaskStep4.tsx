import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'


const SARTaskStep4: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <SARTaskTitle
        title={'Final Marker'}
        subtitle={'Update the marker on the wall, next to the main entrance:'}
      />
    </div>
  )
}

export default SARTaskStep4
