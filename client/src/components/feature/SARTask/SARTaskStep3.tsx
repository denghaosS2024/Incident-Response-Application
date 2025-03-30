import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'


const SARTaskStep3: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address='4400 Forbes Ave, Pittsburgh, PA 15213' /> {/*TODO: load address dynamically*/}
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Victims'}
        subtitle={'Enter the number of victims:'}
      />
      <ReturnToTasksBtn />
    </div>
  )
}

export default SARTaskStep3
