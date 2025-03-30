import { Box, Typography, Paper } from '@mui/material'
import React from 'react'

const SARStep2: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Missing Person Details
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
        Please provide information about the missing person
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Typography variant="body1">
          This section will allow entry of personal details like name, age, gender, physical description, etc.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Last Known Information
        </Typography>
        <Typography variant="body1">
          This section will capture details about when and where the person was last seen, what they were wearing, etc.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Medical & Contact Information
        </Typography>
        <Typography variant="body1">
          This section will record medical conditions, whether they have a phone, and other relevant details.
        </Typography>
      </Paper>
    </Box>
  )
}

export default SARStep2
