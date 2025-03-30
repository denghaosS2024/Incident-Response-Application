import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'


const SARTaskStep1: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <SARTaskTitle
        title={'Initial Marker'}
        subtitle={'Draw this marker on the wall, next to the main entrance:'}
      />
    </div>
  )
}

export default SARTaskStep1
