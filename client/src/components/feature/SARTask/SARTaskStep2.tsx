import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'


const SARTaskStep2: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <SARTaskTitle
        title={'Hazards'}
        subtitle={'Select the hazards you notice:'}
      />
    </div>
  )
}

export default SARTaskStep2
