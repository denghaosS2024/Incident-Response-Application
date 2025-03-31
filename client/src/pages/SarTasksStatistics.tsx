import React from 'react';
import { useParams } from 'react-router-dom';
import Statistics from '../components/SearchAndRescue/Statistics';

const StatisticsPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>(); // Get incidentId from URL

  if (!incidentId) {
    return <p>Error: No incident ID provided.</p>;
  }

  return <Statistics incidentId={incidentId} />;
};

export default StatisticsPage;
