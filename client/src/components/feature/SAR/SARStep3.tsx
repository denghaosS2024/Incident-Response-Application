import { Box, Typography, Paper } from '@mui/material'
import React from 'react'

const SARStep3: React.FC = () => {
  // Commented out as it's not used in this stub implementation
  // const incident: IIncident = useSelector(
  //   (state: RootState) => state.incidentState.incident,
  // )

  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Search Operation Details
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Manage search teams and operation details
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Incident Commander Information
        </Typography>
        <Typography variant="body1">
          This section will allow entry of incident commander details and search operation parameters.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search Teams
        </Typography>
        <Typography variant="body1">
          This section will allow management of search teams, including adding team members and assigning search areas.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Operation Guidelines
        </Typography>
        <Typography variant="body2" paragraph>
          • Ensure all teams have clear instructions and designated areas
        </Typography>
        <Typography variant="body2" paragraph>
          • Maintain regular communication with all search teams
        </Typography>
        <Typography variant="body2" paragraph>
          • Document all search areas covered and findings
        </Typography>
      </Paper>
    </Box>
  )
}

export default SARStep3
