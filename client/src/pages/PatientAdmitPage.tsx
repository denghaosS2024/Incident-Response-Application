import PatientInforForm from '@/components/feature/Reach911/PatientInforForm'
import VisitLogList from '@/components/feature/Reach911/VisitLogList'
import { Box } from '@mui/material'
import React from 'react'
import { useSearchParams } from 'react-router-dom'

const PatientAdmitPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const username = searchParams.get('username') || undefined
    console.log(username)

    return (
        <Box sx={{ height: '100%' }}>
            <PatientInforForm username={username}></PatientInforForm>
            <VisitLogList username={username}></VisitLogList>
        </Box>
    )
}

export default PatientAdmitPage
