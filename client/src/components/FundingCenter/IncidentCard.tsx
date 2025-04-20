import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import { IIncident } from "../models/Incident";

interface Props {
  incident: IIncident;
  onChat: () => void;
}

const IncidentCard: React.FC<Props> = ({ incident, onChat }) => {
  const navigate = useNavigate();

  return (
    <Card key={incident.incidentId} variant="outlined">
      <CardContent>
        <Typography>Incident ID: {incident.incidentId}</Typography>
        <Typography>
          Creation Time:{" "}
          {new Date(incident.openingDate).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </Typography>
        <Typography>Priority: {incident.priority}</Typography>
        <Typography>
          Funding Left: ${incident.funding.toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="outlined" color="primary" onClick={onChat}>
          Chat
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            navigate(`/funding-information/${incident.incidentId}`)
          }
          sx={{ ml: 1 }}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default IncidentCard;
