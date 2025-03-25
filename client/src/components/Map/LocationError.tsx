import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Alert, Box, Typography } from '@mui/material'

/**
 * Display an error message when the location is not found (User disabled location services or denied access or location is not available)
 * @param errorText - The error message to display
 * @returns The error message
 */
export default function LocationError({ errorText }: { errorText: string }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: 2,
        backgroundColor: '#f5f5f5',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Alert
        severity="warning"
        sx={{ mb: 2, width: '100%', boxSizing: 'border-box' }}
      >
        {errorText}
      </Alert>
      <LocationOnIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="body1" align="center">
        Please enter your address in the field above.
      </Typography>
    </Box>
  )
}
