import PatientForm from '@/components/feature/Reach911/PatientForm'
import { Box } from '@mui/material'
import React from 'react'
import { useSearchParams } from 'react-router-dom'

const PatientAdmitPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const username = searchParams.get('username') || undefined
    
    return (
        <Box sx={{ height: '100%' }}>
            <PatientForm username={username}></PatientForm>
        </Box>
    )
}

export default PatientAdmitPage
