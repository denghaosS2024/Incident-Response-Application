import React from 'react';
import { useParams } from 'react-router';
import TodoTasks from '../components/SearchAndRescue/TodoTasks';

// HomePage component: Simple wrapper for the Home component
const TodoTasksPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>(); // Get incidentId from URL
  
  if (!incidentId) {
    return <p>Error: No incident ID provided.</p>;
  }

  return <TodoTasks incidentId={incidentId} />;
}

export default TodoTasksPage
