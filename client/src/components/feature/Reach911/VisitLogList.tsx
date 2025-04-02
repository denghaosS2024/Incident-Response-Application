import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material';
import { useNavigate } from 'react-router';

const VisitLogList: React.FC<{ username?: string }> = ({
  username: propUsername
}) => {
  console.log('VisitLogList propUsername:', propUsername);
  const navigate = useNavigate()

  const handleAddPatient = () => {
    if (propUsername) {
      navigate(
        `/patient-visit?username=${encodeURIComponent(propUsername)}`,
      )
    } else {
      navigate('/patient-visit')
    }
  };

  console.log(propUsername)

  return (
    // TODO: Add list of visit logs here

    // For now, just a button to add a new patient visit log
    <Fab
      color="primary"
      aria-label="add-visit-log"
      onClick={handleAddPatient}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
      }}
    >
      <AddIcon />
    </Fab>
  );
}

export default VisitLogList;