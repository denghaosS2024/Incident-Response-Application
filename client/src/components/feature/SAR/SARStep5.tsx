import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

const SARStep5: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Operation Summary
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Review and finalize the search and rescue operation
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Incident Overview
        </Typography>
        <Typography variant="body1">
          This section will display a summary of the incident details.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search Operation Status
        </Typography>
        <Typography variant="body1">
          This section will show the current status of the search operation.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resource Allocation
        </Typography>
        <Typography variant="body1">
          This section will display the resources allocated to the operation.
        </Typography>
      </Paper>
    </Box>
  )
}

export default SARStep5
