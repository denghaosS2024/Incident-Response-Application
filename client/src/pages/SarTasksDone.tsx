import React from 'react';
import { useParams } from 'react-router-dom';
import DoneTasks from '../components/SearchAndRescue/DoneTasks';

// HomePage component: Simple wrapper for the Home component
const DoneTasksPage: React.FC = () => {
    const { incidentId } = useParams<{ incidentId: string }>(); // Get incidentId from URL
  
    if (!incidentId) {
      return <p>Error: No incident ID provided.</p>;
    }
  
    return <DoneTasks incidentId={incidentId} />;
}

export default DoneTasksPage
