import {Button, Link} from '@mui/material'
import React from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'

interface SARTaskStep3Props {
  incident?: IIncident | null;
}

const SARTaskStep3: React.FC<SARTaskStep3Props> = ({incident }) => {

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address={incident?.address || 'No Address'} />
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Victims'}
        subtitle={'Enter the number of victims:'}
      />

      <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
        <ReturnToTasksBtn />
        <Button
          component={Link}
          href='/patients'  // TODO: redirect to patient page
          className={styles.primaryBtn}
          variant="contained"
          sx={{ mt: 2, mx: 1 }}>
          Treat Victims
        </Button>
      </div>
    </div>
  )
}

export default SARTaskStep3
