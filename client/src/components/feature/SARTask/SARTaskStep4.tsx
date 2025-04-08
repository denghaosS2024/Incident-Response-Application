import { Button } from "@mui/material";
import React from "react";
import { useSearchParams } from "react-router";
import IIncident from "../../../models/Incident.ts";
import styles from "../../../styles/SARTaskPage.module.css";
import request, { IRequestError } from "../../../utils/request.ts";
import AddressBar from "./AddressBar.tsx";
import FEMAMarker from "./FEMAMarker";
import ReturnToTasksBtn from "./ReturnToTasksBtn.tsx";
import SARTaskTitle from "./SARTaskTitle.tsx";
import formatDateTime from "./useCurrentDateTime.tsx";

// Types of victims with their index
const victimTypes = [
  { type: "Immediate", index: 0 },
  { type: "Urgent", index: 1 },
  // { type: 'Could Wait', index: 2 },
  // { type: 'Dismiss', index: 3 },
  { type: "Deceased", index: 4 },
];

interface SARTaskStep4Props {
  incident?: IIncident | null;
  setIncident: (incident: IIncident) => void;
}

const SARTaskStep4: React.FC<SARTaskStep4Props> = ({
  incident,
  setIncident,
}) => {
  const [searchParams] = useSearchParams();
  const taskId = parseInt(searchParams.get("taskId") ?? "0");
  const startDate = incident?.sarTasks?.at(taskId)?.startDate;
  const incidentId = incident?.incidentId;
  const now = new Date();
  const endTime = formatDateTime(now);
  const leftText = `${incidentId ?? "NullId101"} ${
    startDate ? formatDateTime(new Date(startDate)) : ""
  }`;

  const formatHazards = () => {
    const hazards = incident?.sarTasks?.at(taskId)?.hazards;
    if (!hazards || hazards.length === 0) {
      return "No Hazards";
    }
    return hazards.join(" ");
  };

  const formatVictimCounts = () => {
    const victims = incident?.sarTasks?.at(taskId)?.victims || [];

    const parts = [];
    for (const typeObj of victimTypes) {
      const count = victims[typeObj.index];
      if (count && count > 0) {
        parts.push(`${count}-${typeObj.type}`);
      }
    }

    if (parts.length === 0) {
      return "No Victims";
    }
    return parts.join(" ");
  };

  const handleDoneClick = async () => {
    const currentSarTask = incident?.sarTasks?.at(taskId) || {};

    try {
      const response: IIncident = await request(
        `/api/incidents/sar/${incidentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            taskId: taskId,
            sarTask: {
              ...currentSarTask,
              state: "Done",
              endDate: now.toISOString(),
            },
          }),
        },
      );
      setIncident(response);
    } catch (error) {
      const err = error as IRequestError;
      console.error("Error updating SAR task:", err.message);
    }
  };

  return (
    <div className={styles.wrapperStep}>
      <AddressBar task={incident?.sarTasks?.at(taskId)} />
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={"Final Marker"}
        subtitle={"Update the marker on the wall, next to the main entrance:"}
      />
      <div className={styles.flexCenter}>
        <FEMAMarker
          top={endTime}
          right={formatHazards()}
          bottom={formatVictimCounts()}
          left={leftText}
          size={300}
        />
      </div>
      <div
        className={styles.flexCenter}
        style={{ gap: "1rem", marginTop: "2rem" }}
      >
        <ReturnToTasksBtn />
        {incident?.sarTasks?.at(taskId)?.state !== "Done" && (
          <Button
            className={styles.primaryBtn}
            onClick={handleDoneClick}
            variant="contained"
            sx={{ mt: 2, mx: 1 }}
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default SARTaskStep4;
