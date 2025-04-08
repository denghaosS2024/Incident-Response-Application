import IPatient from "@/models/Patient";
import { Box, Typography } from "@mui/material";
import React from "react";
import { Draggable } from "react-beautiful-dnd";

interface PatientProps {
  patient: IPatient;
  id: string;
  index: number;
}

const PatientCard: React.FC<PatientProps> = ({ patient, index }) => {
  const draggableId = patient.patientId;

  const userID = localStorage.getItem("uid");
  const isAssignedToUser = patient.master === userID;

  console.log(
    "ths component is assigned to user: ",
    isAssignedToUser,
    " for patient: ",
    patient.name,
    " with master: ",
    patient.master,
    " and userID: ",
    userID,
  );
  const style = [
    "p-2 m-2",
    "border border-gray-300 rounded-lg",
    isAssignedToUser ? "bg-gray-300" : "bg-white",
  ].join(" ");

  return (
    <Draggable
      draggableId={draggableId}
      index={index}
      isDragDisabled={!isAssignedToUser}
    >
      {(providedDrag, snapshotDrag) => {
        const isDragging = snapshotDrag.isDragging;
        const dynamicStyle = [
          style,
          isDragging ? "border border-gray-300 rounded-lg w-fit" : "",
        ].join(" ");

        return (
          <Box
            ref={providedDrag.innerRef}
            {...providedDrag.draggableProps}
            {...providedDrag.dragHandleProps}
            className={dynamicStyle}
          >
            <Typography
              variant="body2"
              className="text-sm text-gray-500"
              fontWeight={isAssignedToUser ? "bold" : "normal"}
            >
              {patient.name}
            </Typography>
          </Box>
        );
      }}
    </Draggable>
  );
};

export default PatientCard;
