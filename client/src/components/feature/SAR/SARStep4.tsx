import { Box, Typography, Paper } from '@mui/material'
import React from 'react'

const SARStep4: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Resource Management
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Manage resources for the search and rescue operation
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Resources
        </Typography>
        <Typography variant="body1">
          This section will display available resources that can be assigned to the operation.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Assigned Resources
        </Typography>
        <Typography variant="body1">
          This section will show resources that have been assigned to the operation.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resource Requests
        </Typography>
        <Typography variant="body1">
          This section will allow requesting additional resources for the operation.
        </Typography>
      </Paper>
    </Box>
  )
}

export default SARStep4
