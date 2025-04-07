import { Box, Button, Divider, Typography } from '@mui/material'
import { useLocation } from 'react-router'
import StatisticsAndAdditionalInfo from '../components/IncidentReport/StatisticsAndAdditionalInfo.tsx'
import Step1EmergencyDetails from '../components/IncidentReport/Step1EmergencyDetails'
import Step2EmergencyType from '../components/IncidentReport/Step2EmergencyType'
import Step3PatientData from '../components/IncidentReport/Step3PatientData.tsx'
import Step4Communication from '../components/IncidentReport/Step4Communication.tsx'
import Step5ResponseTimeline from '../components/IncidentReport/Step5ResponseTimeline.tsx'

const IncidentReportPage = () => {
    const location = useLocation()
    const { incidentData } = location.state ?? {}

    const currentUsername = localStorage.getItem('username')

    if (!incidentData) {
        return <div>No incident data available</div>
    }

    const isResponderReadOnly =
        incidentData.commander !== currentUsername 

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Incident Highlights
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Incident ID: {incidentData.incidentId}
                </Typography>
                <Typography variant="h6">
                    Incident Caller: {incidentData.caller}
                </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Step1EmergencyDetails incidentData={incidentData} />
            <Step2EmergencyType incidentData={incidentData} />
            <Step3PatientData incidentData={incidentData} />
            <Step4Communication incidentData={incidentData} />

            <Divider sx={{ my: 3 }} />

            <Step5ResponseTimeline incident={incidentData} />
            <StatisticsAndAdditionalInfo incident={incidentData} readonly={isResponderReadOnly} />

            <Box textAlign="center" mt={4} mb={2}>
                <Button variant="outlined" onClick={() => window.print()}>
                    Print Report
                </Button>
            </Box>
        </Box>
    )
}

export default IncidentReportPage
