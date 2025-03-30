import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'


interface AddressBarProps {
  address: string;
}

const AddressBar: React.FC<AddressBarProps> = ({ address }) => {
  // Function to open the map app with the given address
  const openInMaps = (): void => {
    const encodedAddress: string = encodeURIComponent(address)
    const mapsUrl: string = `https://maps.google.com?q=${encodedAddress}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: '0px',
        width: '100%',
        // maxWidth: '600px'
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        flex: 1
      }}>
        <LocationOnIcon
          color="primary"
          fontSize="small"
          sx={{ marginRight: 1 }}
        />
        <Typography
          variant="body1"
          noWrap
          title={address} // Shows full address on hover
          sx={{
            flexGrow: 1
          }}
        >
          {address}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="small"
        onClick={openInMaps}
        sx={{
          minWidth: '64px',
          marginLeft: 2
        }}
      >
        Map
      </Button>
    </Paper>
  )
}

export default AddressBar
