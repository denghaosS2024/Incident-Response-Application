import { useLocation } from 'react-router-dom'
import Step5ResponseTimeline from '../components/IncidentReport/Step5ResponseTimeline.tsx'

const IncidentReportPage = () => {
    const location = useLocation()
    const { incidentData } = location.state || {}

    console.log('Received incident data:', incidentData)
    return (
        <div>
            <Step5ResponseTimeline />
        </div>
    )
}

export default IncidentReportPage
