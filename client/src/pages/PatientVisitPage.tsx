import PatientInforForm from '@/components/feature/Reach911/PatientInforForm'
import VisitLogForm from '@/components/feature/Reach911/VisitLogForm'
import { useSearchParams } from 'react-router-dom'

const PatientVisitPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const username = searchParams.get('username') || undefined

  console.log('PatientVisitPage username:', username)

  return (
    <div style={{ overflowY: 'auto' }}>
      <PatientInforForm username={username} />
      <VisitLogForm username={username} />
    </div>
  )
}

export default PatientVisitPage
