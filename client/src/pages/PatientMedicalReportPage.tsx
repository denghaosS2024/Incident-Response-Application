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
import React, { useEffect } from "react";
import { useSearchParams } from "react-router";

interface TimelineEvent {
  title: string;
  nurse: string;
  timestamp: string;
}

const mockEvents: TimelineEvent[] = [
  { title: "Patient En Route", nurse: "Olivia", timestamp: "2026.8.2 19:30" },
  {
    title: "Patient Visit Created",
    nurse: "Olivia",
    timestamp: "2026.8.2 20:30",
  },
  {
    title: "Priority Updated: E",
    nurse: "Olivia",
    timestamp: "2026.8.2 21:30",
  },
  {
    title: "Drugs Updated: Ceftriaxone",
    nurse: "Olivia",
    timestamp: "2026.8.2 22:30",
  },
  {
    title: "Condition Updated: Cardiac Arrest",
    nurse: "Olivia",
    timestamp: "2026.8.2 22:40",
  },
];

const PatientMedicalReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const theme = useTheme();

  useEffect(() => {
    if (patientId) {
      console.log("🔍 patientId from URL:", patientId);
      // fetch real events next
    }
  }, [patientId]);

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
        Medical Timeline
      </Typography>

      {patientId && (
        <Typography
          variant="subtitle2"
          color="text.secondary"
          textAlign="center"
          mb={2}
        >
          Viewing report for patient <strong>{patientId}</strong>
        </Typography>
      )}

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
        {mockEvents.map((event, idx) => (
          <TimelineItem key={idx}>
            <TimelineSeparator>
              <TimelineDot />
              {idx < mockEvents.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ px: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle1">{event.title}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalHospitalIcon color="error" fontSize="small" />
                    <Typography variant="body2">{event.nurse}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {event.timestamp}
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
