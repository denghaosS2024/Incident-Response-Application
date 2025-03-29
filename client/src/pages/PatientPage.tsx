import PatientForm from '@/components/feature/Reach911/PatientForm'
import { Box } from '@mui/material'
import React from 'react'
import { useSearchParams } from 'react-router-dom'

const PatientPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const username = searchParams.get('username') || undefined
    return (
        <Box sx={{ height: '100%' }}>
            {/* <Box sx={{ borderBottom: '1px solid #ccc' }}>
        <Typography variant="h6" fontWeight="bold">
          {channelName}
        </Typography>
      </Box> */}
            <PatientForm username={username}></PatientForm>
        </Box>
    )
}

export default PatientPage
