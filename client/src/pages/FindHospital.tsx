import AlertSnackbar from "@/components/common/AlertSnackbar";
import HospitalList from "@/components/feature/FindHospital/HospitalList";
import PatientList from "@/components/feature/FindHospital/PatientList";
import IPatient from "@/models/Patient";
import { fetchHospitals, sortHospitalsByDistance } from "@/redux/hospitalSlice";
import { fetchPatients } from "@/redux/patientSlice";
import { AppDispatch, RootState } from "@/redux/store";
import eventEmitter from "@/utils/eventEmitter";
import request from "@/utils/request";
import { Map as MapIcon } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const FindHospital: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const hospitals = useSelector((state: RootState) => state.hospital.hospitals);
  const patients = useSelector(
    (state: RootState) => state.patientState.patients,
  );

  const [draggedPatients, setDraggedPatients] = useState<
    Record<string, IPatient[]>
  >({});
  const [unassignedPatients, setUnassignedPatients] = useState<IPatient[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchHospitals());
      await dispatch(sortHospitalsByDistance());
      await dispatch(fetchPatients());
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    console.log("Hospitals:", hospitals);
    console.log("Patients:", patients);

    const initialDraggedPatients: Record<string, IPatient[]> = {};

    hospitals.forEach((hospital) => {
      initialDraggedPatients[hospital.hospitalId] = hospital.patients
        ? hospital.patients
            .map((patientId) => {
              const matchedPatient = patients.find((patient) => {
                return (
                  String(patient.patientId).trim() === String(patientId).trim()
                );
              });
              if (!matchedPatient) {
                console.warn(`No match found for patientId: ${patientId}`);
              }
              // Exclude ER patients for Remove Patient From Find Hospital
              if (matchedPatient?.location === "ER") {
                return undefined;
              }
              
              return matchedPatient;
            })
            .filter((patient): patient is IPatient => !!patient) // Filter out undefined patients
        : [];
    });

    const assignedPatientIds = hospitals
      .flatMap((hospital) => hospital.patients ?? [])
      .filter((id): id is string => !!id);

    const initialUnassignedPatients = patients.filter(
      (patient) =>
        !!patient.patientId && // Ensure patientId is defined
        !assignedPatientIds.includes(patient.patientId),
    );

    console.log("Initial Dragged Patients:", initialDraggedPatients);
    console.log("Initial Unassigned Patients:", initialUnassignedPatients);

    setDraggedPatients(initialDraggedPatients);
    setUnassignedPatients(initialUnassignedPatients);
  }, [hospitals, patients]);

  // Navigate to map and activate hospital layer
  const redirectToMapWithHospitals = () => {
    // Navigate to the map page
    navigate("/map");

    // Emit event to activate the hospital layer after a small delay to ensure
    // the map component is loaded and event listeners are attached
    setTimeout(() => {
      eventEmitter.emit("selectUtil", { layer: "Util", visible: true });
      eventEmitter.emit("selectUtil", { layer: "Hospitals", visible: true });
    }, 500);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) return;

    const draggedPatient =
      unassignedPatients.find((p) => p.patientId === draggableId) ??
      Object.values(draggedPatients)
        .flat()
        .find((p) => p.patientId === draggableId);

    if (!draggedPatient) return;

    if (source.droppableId === "patients") {
      setUnassignedPatients((prev) =>
        prev.filter((p) => p.patientId !== draggableId),
      );
    } else {
      setDraggedPatients((prev) => {
        const updated = { ...prev };
        updated[source.droppableId] = updated[source.droppableId].filter(
          (p) => p.patientId !== draggableId,
        );
        return updated;
      });
    }

    if (destination.droppableId === "patients") {
      setUnassignedPatients((prev) => [...prev, draggedPatient]);
    } else {
      setDraggedPatients((prev) => {
        const updated = { ...prev };
        if (!updated[destination.droppableId]) {
          updated[destination.droppableId] = [];
        }
        updated[destination.droppableId].push(draggedPatient);
        return updated;
      });
    }
  };

  const handleBatchUpdate = async () => {
    const requestBody = Object.entries(draggedPatients).map(
      ([hospitalId, patients]) => ({
        hospitalId,
        patients: patients.map((patient) => patient.patientId),
      }),
    );

    console.log("Batch Update Request Body:", requestBody);
    try {
      const response = await request("/api/hospital/patients/batch", {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });

      console.log("Batch Update Response:", response);
      setSnackbarMessage("Patients assigned to hospital successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const error = err as Error;
      console.error("Batch Update Error:", error);
      setSnackbarMessage(
        `Failed to assign patients to hospitals: ${error.message}`,
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box padding={2}>
      <Box marginY={2}>
        <Typography variant="body1" gutterBottom>
          Drag and drop patients:
        </Typography>
      </Box>

      <Box className="flex flex-row justify-between gap-x-4 w-full">
        <DragDropContext onDragEnd={handleDragEnd} key={0}>
          <Box className="flex flex-row justify-between gap-x-4 w-full">
            <PatientList patients={unassignedPatients}></PatientList>
            <HospitalList
              hospitals={hospitals}
              draggedPatients={draggedPatients}
            ></HospitalList>
          </Box>
        </DragDropContext>
      </Box>

      <Box display="flex" justifyContent="center" marginY={2} gap={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MapIcon />}
          onClick={redirectToMapWithHospitals}
          size="medium"
        >
          Map
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleBatchUpdate}
          size="medium"
        >
          Submit
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => navigate(-1)}
          size="medium"
        >
          Cancel
        </Button>
      </Box>

      <AlertSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
        vertical="bottom"
        horizontal="center"
      />
    </Box>
  );
};

export default FindHospital;
