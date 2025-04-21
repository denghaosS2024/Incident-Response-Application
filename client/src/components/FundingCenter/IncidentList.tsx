import React from "react";
import { Stack, Typography } from "@mui/material";
import IIncident from "../../models/Incident";
import IncidentCard from "./IncidentCard";

interface Props {
  incidents: IIncident[];
}

const IncidentList: React.FC<Props> = ({ incidents }) => (
  <>
    <Typography variant="h6" gutterBottom>
      Incidents in Your City
    </Typography>
    <Stack spacing={2}>
      {incidents.map((incident) => (
        <IncidentCard key={incident.incidentId} incident={incident} />
      ))}
    </Stack>
  </>
);

export default IncidentList;
