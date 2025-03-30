import { Button } from '@mui/material'
import React from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import FEMAMarker from './FEMAMarker'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import { useCurrentDateTime } from './useCurrentDateTime.tsx'
const SARTaskStep4: React.FC = () => {
    const { formattedDateTime } = useCurrentDateTime()
    const handleDoneClick = () => {
    // TODO
    alert('Task marked as done!')
  }

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
          top={formattedDateTime}
          right='[FAKE] Dogs Foods'
          bottom='[FAKE] 1-Immediate 2-Urgent'
          left='[FAKE] SDena101 04.04.21 1:40pm'
          size={300}
        />
      </div>

      <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
        <ReturnToTasksBtn />
        <Button className={styles.primaryBtn} onClick={handleDoneClick} variant="contained"
        sx={{ mt: 2, mx: 1 }}>
          Done
        </Button>
      </div>
    </div>
  )
}

export default SARTaskStep4
