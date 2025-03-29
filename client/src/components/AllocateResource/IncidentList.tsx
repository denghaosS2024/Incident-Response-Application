import React from 'react';
import { Card, CardContent, List } from '@mui/material';
import IIncident from '../../models/Incident';
import IncidentItem from './IncidentItem';

interface IncidentListProps {
  incidents: IIncident[];
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
  const sortedIncidents = [...incidents].sort((a, b) =>
    a.incidentId.localeCompare(b.incidentId)
  );

  return (
    <Card className="shadow-sm">
      <CardContent>
        <List>
          {sortedIncidents.map((incident) => (
            <IncidentItem key={incident.incidentId} incident={incident} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default IncidentList;