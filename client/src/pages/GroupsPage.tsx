import React from 'react'
import {Container, Fab, Link} from '@mui/material'
import AddIcon from "@mui/icons-material/Add"

//Pages
import GroupDirectory from '../components/GroupDir/GroupDirectory'


const Groups: React.FC = () => {

  return (
    <Container>
      <GroupDirectory />

      {/* Plus button for creating new group */}
      <Link
        href={'/groups/new'}
        underline="none"
        sx={{ display: 'inline-block' }}
      >
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#1976d2', // primary blue color
            '&:hover': {
              backgroundColor: '#1565c0', // darker blue on hover
            }}}
        >
          <AddIcon />
        </Fab>
      </Link>

    </Container>
  )
}

export default Groups
