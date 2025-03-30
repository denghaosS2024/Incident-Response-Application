import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'


const SARTaskStep3: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <SARTaskTitle
        title={'Victims'}
        subtitle={'Enter the number of victims:'}
      />
    </div>
  )
}

export default SARTaskStep3
