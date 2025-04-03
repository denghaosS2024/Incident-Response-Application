import PatientCreationForm from '@/components/feature/Reach911/PatientCreationForm'
import VisitLogForm from '@/components/feature/Reach911/VisitLogForm'
import { useSearchParams } from 'react-router'

const PatientVisitPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const username = searchParams.get('username') || undefined

    console.log('PatientVisitPage username:', username)

    return (
        <div style={{ overflowY: 'auto' }}>
            <PatientCreationForm username={username} />
            <VisitLogForm username={username} />
        </div>
    )
}

export default PatientVisitPage
