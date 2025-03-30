import React, { useEffect, useState } from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import SARTaskTitle from './SARTaskTitle.tsx'
import AddressBar from './AddressBar.tsx'


const SARTaskStep2: React.FC = () => {

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address='4400 Forbes Ave, Pittsburgh, PA 15213' /> {/*TODO: load address dynamically*/}
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Hazards'}
        subtitle={'Select the hazards you notice:'}
      />
    </div>
  )
}

export default SARTaskStep2
