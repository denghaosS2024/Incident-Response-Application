import request from "@/utils/request";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

interface FieldChange {
  field: string;
  newValue: string | number | boolean | string[];
}
interface RawEvent {
  changes: FieldChange[];
  snapshot: {
    dateTime: string;
  };
  updatedBy: string;
  timestamp: string;
}
interface TimelineResponse {
  visitLogId: string;
  events: RawEvent[];
}

const PatientMedicalReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const theme = useTheme();

  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);

  useEffect(() => {
    if (!patientId) return;

    request(`/api/patients/timeline/${patientId}`)
      .then((res) => res as TimelineResponse)
      .then(setTimeline)
      .catch((err) => {
        console.error("Failed to load timeline:", err);
      });
  }, [patientId]);

  if (!patientId || !timeline) return null;

  const items: Array<{ titleLines: string[]; nurse: string; ts: string }> = [];

  items.push({
    titleLines: ["Patient Visit Created"],
    nurse: timeline.events[0]?.updatedBy || "System",
    ts: timeline.events[0]?.snapshot.dateTime,
  });

  timeline.events.forEach((evt) => {
    if (evt.changes.length === 0) return;

    const lines = evt.changes.map((c) => {
      const prettyField = c.field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      const value = Array.isArray(c.newValue)
        ? c.newValue.join(", ")
        : String(c.newValue);
      return `${prettyField} updated: ${value}`;
    });

    items.push({
      titleLines: lines,
      nurse: evt.updatedBy,
      ts: evt.timestamp,
    });
  });

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
        Medical Timeline
      </Typography>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        textAlign="center"
        mb={2}
      >
        Viewing report for patient <strong>{patientId}</strong>
      </Typography>

      <Timeline
        position="right"
        sx={{
          px: 0,
          "& .MuiTimelineItem-root:before": {
            left: theme.spacing(2),
            flex: 0,
            padding: 0,
          },
        }}
      >
        {items.map((item, idx) => (
          <TimelineItem key={idx}>
            <TimelineSeparator>
              <TimelineDot />
              {idx < items.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ px: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  {item.titleLines.map((line, i) => (
                    <Typography key={i} variant="subtitle1">
                      {line}
                    </Typography>
                  ))}
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalHospitalIcon color="error" fontSize="small" />
                    <Typography variant="body2">{item.nurse}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.ts).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton>
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mt: 1 }} />
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <Box textAlign="center" mt={4} mb={2}>
        <Button variant="outlined" onClick={() => window.print()}>
          Print Report
        </Button>
      </Box>
    </Box>
  );
};

export default PatientMedicalReportPage;
