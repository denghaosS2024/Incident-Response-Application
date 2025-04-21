import request from "@/utils/request";
import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

interface FieldChange {
  field: string;
  newValue: any;
}
interface VisitEvent {
  changes: FieldChange[];
  snapshot: Record<string, any> & { dateTime: string };
}

const FIELD_ORDER: string[] = [
  "priority",
  "location",
  "age",
  "conscious",
  "breathing",
  "chiefComplaint",
  "condition",
  "drugs",
  "allergies",
  "updatedBy",
  "timestamp",
];

const FIELD_LABELS: Record<string, string> = {
  priority: "Priority",
  location: "Location",
  age: "Age",
  conscious: "Conscious Status",
  breathing: "Breathing Status",
  chiefComplaint: "Chief Complaint",
  condition: "Condition",
  drugs: "Drugs",
  allergies: "Allergies",
  updatedBy: "Updated By",
  timestamp: "Updated Time",
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:00`;
};

const ViewPatientVisitPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId")!;
  const visitLogId = searchParams.get("visitLogId") ?? "";
  const eventIndex = Number(searchParams.get("eventIndex") ?? -1);

  const [event, setEvent] = useState<VisitEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const resp = (await request(
          `/api/patients/timeline/${patientId}?visitLogId=${visitLogId}`,
        )) as { visitLogId: string; events: VisitEvent[] };
        if (
          Array.isArray(resp.events) &&
          eventIndex >= 0 &&
          eventIndex < resp.events.length
        ) {
          setEvent(resp.events[eventIndex]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (patientId && eventIndex >= 0) {
      fetchEvent();
    } else {
      setLoading(false);
    }
  }, [patientId, visitLogId, eventIndex]);

  if (loading) {
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box p={2}>
        <Typography color="error">
          Could not find that visit snapshot.
        </Typography>
      </Box>
    );
  }

  const changedFields = new Set(event.changes.map((c) => c.field));
  const snapshot = {
    ...event.snapshot,
    updatedBy: event.updatedBy,
    timestamp: event.timestamp,
  };

  return (
    <Box p={2}>
      {FIELD_ORDER.map((field) => {
        const label = FIELD_LABELS[field] ?? field;
        let value = snapshot[field];

        if (field === "timestamp" && typeof value === "string") {
          value = formatDate(value);
        }

        const displayValue =
          value == null || value === ""
            ? "—"
            : Array.isArray(value)
              ? value.join(", ")
              : String(value);

        const isChanged = changedFields.has(field);

        return (
          <Box
            key={field}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 1,
              mb: 1,
              borderRadius: 1,
              backgroundColor: isChanged
                ? "rgba(255,235,59,0.2)"
                : "transparent",
            }}
          >
            <Typography sx={{ fontWeight: isChanged ? "bold" : "normal" }}>
              {label}
            </Typography>
            <Typography>{displayValue}</Typography>
          </Box>
        );
      })}
      <Divider sx={{ mt: 2 }} />

      {/* If the paient is discharged, the message will be shown here. */}
      {event.snapshot.active === false && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            backgroundColor: "rgba(76,175,80,0.2)",
          }}
        >
          <Typography>This patient has been discharged.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ViewPatientVisitPage;
