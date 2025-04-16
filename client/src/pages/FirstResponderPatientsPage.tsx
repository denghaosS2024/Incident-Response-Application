import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  CircularProgress,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import request from "../utils/request";
import ROLES from "../utils/Roles";
import SocketClient from "../utils/Socket";

// Define patient types based on categories
interface Patient {
  patientId: string;
  name: string;
  priority: string;
  location: string;
  incidentId?: string;
}

interface PatientsByCategory {
  toTakeToER: Patient[];
  atER: Patient[];
  others: Patient[];
}

// Styled components
const CategoryHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  width: "100%",
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
}));

const PatientListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(0.5),
  border: "1px solid #e0e0e0",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#f0f7ff",
  },
}));

const FirstResponderPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientsByCategory>({
    toTakeToER: [],
    atER: [],
    others: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAssignedIncidents, setHasAssignedIncidents] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const socketRef = useRef(SocketClient);

  // Get user information from localStorage
  const userRole = localStorage.getItem("role");
  const userId = localStorage.getItem("uid");
  const username = localStorage.getItem("username");

  // Only allow Fire and Police to access this page
  useEffect(() => {
    if (userRole !== ROLES.FIRE && userRole !== ROLES.POLICE) {
      navigate("/");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchAssignedIncidents = async () => {
      const sarIncidents = await request(`/api/incidents/sar?commander=${username}`, {
        method: "GET",
      });

      if (sarIncidents) {
        console.log("sometion")
        setHasAssignedIncidents(true);
      }
    };

    fetchAssignedIncidents();
  }, [username]);

  const fetchPatientsData = useCallback(async () => {
    if (!username) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    try {
      // First get incidents that the responder is associated with
      const incidents = await request(
        `/api/incidents?commander=${username}`,
        {
          method: "GET",
        },
      );

      // // Set hasAssignedIncidents based on whether there are any incidents
      // setHasAssignedIncidents(incidents && incidents.length > 0);

      if (!incidents || incidents.length === 0) {
        setLoading(false);
        return;
      }

      // Get all patients
      const allPatients = await request("/api/patients", {
        method: "GET",
      });

      if (!allPatients || allPatients.length === 0) {
        setLoading(false);
        return;
      }

      // Filter patients related to the responder's incidents
      const incidentIds = incidents.map(
        (incident: any) => incident.incidentId,
      );

      const responderPatients = allPatients.filter((patient: any) => {
        if (!patient.visitLog || patient.visitLog.length === 0) return false;

        // Check if any visit log entry is associated with one of the responder's incidents
        return patient.visitLog.some((log: any) =>
          incidentIds.includes(log.incidentId),
        );
      });

      // Sort and categorize patients
      const categorizedPatients: PatientsByCategory = {
        toTakeToER: [],
        atER: [],
        others: [],
      };

      responderPatients.forEach((patient: any) => {
        // Get the most recent visit log for categorization by sorting by dateTime
        const recentLog = [...patient.visitLog].sort(
          (a: any, b: any) =>
            new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
        )[0];

        if (!recentLog) return; // Skip if no visit log

        const patientItem: Patient = {
          patientId: patient.patientId,
          name: patient.name ?? "Unknown",
          priority: recentLog.priority ?? "4",
          location: recentLog.location ?? "Unknown",
          incidentId: recentLog.incidentId,
        };

        // Categorize based on priority and location from the latest visitLog
        if (
          (patientItem.priority === "E" || patientItem.priority === "1") &&
          patientItem.location === "Road"
        ) {
          categorizedPatients.toTakeToER.push(patientItem);
        } else if (
          (patientItem.priority === "E" || patientItem.priority === "1") &&
          patientItem.location === "ER"
        ) {
          categorizedPatients.atER.push(patientItem);
        } else {
          // Patients with priority 2, 3, or 4 go to 'Others'
          categorizedPatients.others.push(patientItem);
        }
      });

      // Sort patients by priority in each category
      const priorityOrder: Record<string, number> = {
        E: 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
      };

      const sortByPriority = (a: Patient, b: Patient) => {
        const priorityA = priorityOrder[a.priority] || 999;
        const priorityB = priorityOrder[b.priority] || 999;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If priority is the same, sort alphabetically by name
        return (a.name || "").localeCompare(b.name || "");
      };

      categorizedPatients.toTakeToER.sort(sortByPriority);
      categorizedPatients.atER.sort(sortByPriority);
      categorizedPatients.others.sort(sortByPriority);

      setPatients(categorizedPatients);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients data");
      setLoading(false);
    }
  }, [username]);


  // Fetch patients data for the responder's incidents
  useEffect(() => {
    // const fetchPatientsData = async () => {
    //   if (!username) {
    //     setError("User not logged in");
    //     setLoading(false);
    //     return;
    //   }

    //   try {
    //     // First get incidents that the responder is associated with
    //     const incidents = await request(
    //       `/api/incidents?commander=${username}`,
    //       {
    //         method: "GET",
    //       },
    //     );

    //     // // Set hasAssignedIncidents based on whether there are any incidents
    //     // setHasAssignedIncidents(incidents && incidents.length > 0);

    //     if (!incidents || incidents.length === 0) {
    //       setLoading(false);
    //       return;
    //     }

    //     // Get all patients
    //     const allPatients = await request("/api/patients", {
    //       method: "GET",
    //     });

    //     if (!allPatients || allPatients.length === 0) {
    //       setLoading(false);
    //       return;
    //     }

    //     // Filter patients related to the responder's incidents
    //     const incidentIds = incidents.map(
    //       (incident: any) => incident.incidentId,
    //     );

    //     const responderPatients = allPatients.filter((patient: any) => {
    //       if (!patient.visitLog || patient.visitLog.length === 0) return false;

    //       // Check if any visit log entry is associated with one of the responder's incidents
    //       return patient.visitLog.some((log: any) =>
    //         incidentIds.includes(log.incidentId),
    //       );
    //     });

    //     // Sort and categorize patients
    //     const categorizedPatients: PatientsByCategory = {
    //       toTakeToER: [],
    //       atER: [],
    //       others: [],
    //     };

    //     responderPatients.forEach((patient: any) => {
    //       // Get the most recent visit log for categorization by sorting by dateTime
    //       const recentLog = [...patient.visitLog].sort(
    //         (a: any, b: any) =>
    //           new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    //       )[0];

    //       if (!recentLog) return; // Skip if no visit log

    //       const patientItem: Patient = {
    //         patientId: patient.patientId,
    //         name: patient.name ?? "Unknown",
    //         priority: recentLog.priority ?? "4",
    //         location: recentLog.location ?? "Unknown",
    //         incidentId: recentLog.incidentId,
    //       };

    //       // Categorize based on priority and location from the latest visitLog
    //       if (
    //         (patientItem.priority === "E" || patientItem.priority === "1") &&
    //         patientItem.location === "Road"
    //       ) {
    //         categorizedPatients.toTakeToER.push(patientItem);
    //       } else if (
    //         (patientItem.priority === "E" || patientItem.priority === "1") &&
    //         patientItem.location === "ER"
    //       ) {
    //         categorizedPatients.atER.push(patientItem);
    //       } else {
    //         // Patients with priority 2, 3, or 4 go to 'Others'
    //         categorizedPatients.others.push(patientItem);
    //       }
    //     });

    //     // Sort patients by priority in each category
    //     const priorityOrder: Record<string, number> = {
    //       E: 0,
    //       "1": 1,
    //       "2": 2,
    //       "3": 3,
    //       "4": 4,
    //     };

    //     const sortByPriority = (a: Patient, b: Patient) => {
    //       const priorityA = priorityOrder[a.priority] || 999;
    //       const priorityB = priorityOrder[b.priority] || 999;

    //       if (priorityA !== priorityB) {
    //         return priorityA - priorityB;
    //       }

    //       // If priority is the same, sort alphabetically by name
    //       return (a.name || "").localeCompare(b.name || "");
    //     };

    //     categorizedPatients.toTakeToER.sort(sortByPriority);
    //     categorizedPatients.atER.sort(sortByPriority);
    //     categorizedPatients.others.sort(sortByPriority);

    //     setPatients(categorizedPatients);
    //     setLoading(false);
    //   } catch (err) {
    //     console.error("Error fetching patients:", err);
    //     setError("Failed to load patients data");
    //     setLoading(false);
    //   }
    // };

    fetchPatientsData();
  }, [fetchPatientsData]);

  useEffect(() => {
    const socket = SocketClient.connect();

    SocketClient.on("patientUpdated", (payload) => {
      console.log("Received patientUpdated from server:", payload);
      fetchPatientsData();
    });

    return () => {
      SocketClient.off("patientUpdated");
    };
  })

  // Navigate to patient detail page
  const handlePatientClick = async (patientId: string) => {
    // Fetch patient data to get username
    const patients = await request("/api/patients", {
      method: "GET",
    });

    // Find the patient with matching patientId
    const patient = patients.find((p: Patient) => p.patientId === patientId);

    // Navigate using username
    navigate(`/patients/admit?username=${patient.username}`);
  };

  // Navigate to patient admission page
  const handleAddPatient = () => {
    navigate("/patients/admit");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", padding: 2, position: "relative", pb: 10 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Patients
      </Typography>

      {/* To Take To ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold" color="white">
          To Take To ER
        </Typography>
      </CategoryHeader>
      <List sx={{ width: "100%" }}>
        {patients.toTakeToER.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.toTakeToER.map((patient) => (
            <PatientListItem
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText primary={patient.name} sx={{ flex: "3 1 auto" }} />
              <Box sx={{ flex: "1 1 auto", textAlign: "center" }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>

      {/* At ER */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold" color="white">
          At ER
        </Typography>
      </CategoryHeader>
      <List sx={{ width: "100%" }}>
        {patients.atER.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.atER.map((patient) => (
            <PatientListItem
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText primary={patient.name} sx={{ flex: "3 1 auto" }} />
              <Box sx={{ flex: "1 1 auto", textAlign: "center" }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>

      {/* Others */}
      <CategoryHeader>
        <Typography variant="subtitle1" fontWeight="bold" color="white">
          Others
        </Typography>
      </CategoryHeader>
      <List sx={{ width: "100%" }}>
        {patients.others.length === 0 ? (
          <ListItem>
            <ListItemText primary="No patients in this category" />
          </ListItem>
        ) : (
          patients.others.map((patient) => (
            <PatientListItem
              key={patient.patientId}
              onClick={() => handlePatientClick(patient.patientId)}
            >
              <ListItemText primary={patient.name} sx={{ flex: "3 1 auto" }} />
              <Box sx={{ flex: "1 1 auto", textAlign: "center" }}>
                <Typography variant="body1">{patient.priority}</Typography>
              </Box>
              <IconButton edge="end">
                <ChevronRightIcon />
              </IconButton>
            </PatientListItem>
          ))
        )}
      </List>

      {/* Add Patient FAB - only visible if first responder is assigned to incidents */}
      {hasAssignedIncidents && (
        <Fab
          color="primary"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          onClick={handleAddPatient}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default FirstResponderPatientsPage;
