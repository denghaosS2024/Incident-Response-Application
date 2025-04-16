import request from "@/utils/request";
import AddIcon from "@mui/icons-material/Add";
import { Box, Fab, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "../../../redux/store";

// { Date: '11.22.20-08:00', Location: 'ER El Camino', Link: '>' },

const VisitLogList: React.FC<{ username?: string }> = ({
  username: propUsername,
}) => {
  console.log("VisitLogList propUsername:", propUsername);
  const navigate = useNavigate();
  const { patients } = useSelector((state: RootState) => state.patientState);
  const [visitLogs, setVisistLogs] = useState([]);

  const getCurrentPatientId = () => {
    if (!patients || patients.length === 0 || !propUsername) {
      return "";
    }
    const patient = patients.find((p) => p.username === propUsername);
    return patient ? patient.patientId : "";
  };

  console.log("Current Patient ID:", getCurrentPatientId());

  const getCurrentPatient = () => {
    if (!patients || patients.length === 0 || !propUsername) {
      return null;
    }
    const patient = patients.find((p) => p.username === propUsername);
    return patient ? patient : null;
  };

  const getCurrentPatientVisitLogs = () => {
    const patient = getCurrentPatient();
    if (!patient || !patient.visitLog) {
      return [];
    }
    return patient.visitLog;
  };

  // const navigate2SpecificVisitLog = (incidentId: string) => {
  const navigate2SpecificVisitLog = (visitLogId: string, active: boolean) => {
    if (!propUsername) {
      return;
    }
    navigate(
      `/patient-visit?username=${encodeURIComponent(
        propUsername,
      )}&visitLogId=${encodeURIComponent(visitLogId)}&active=${active}`,
    );
  };

  // const handleLinkClick = (incidentId: string) => {
  const handleLinkClick = (visitLogId: string, active: boolean) => {
    navigate2SpecificVisitLog(visitLogId, active);
  };

  // Function to format date for visit log
  const formatDateForVisitLog = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}.${day}.${year}-${hours}:${minutes}`;
  };

  // Function to sort visit logs from newest to oldest (latest is active; others are inactive)
  const sortVisitLogsByDateDesc = (visitLogs) => {
    return [...visitLogs].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  };

  // Function to get full location
  // Road, keep as is
  // ER, add hospital name
  const getFullLocation = (location, hospitalName) => {
    if (location === "Road") {
      return "Road";
    } else if (location === "ER") {
      if (hospitalName) {
        return `ER ${hospitalName}`;
      }
      return "ER";
    }
    return location;
  };

  // Function to format visit logs for display
  const formatVisitLogs = (visitLogs) => {
    return visitLogs.map((log) => {
      const date = new Date(log.dateTime);
      const formattedDate = formatDateForVisitLog(date);

      return {
        _id: log._id,
        active: log.active,
        Date: formattedDate,
        // Location: log.location,
        Location: getFullLocation(log.location, log.hospitalName),
        Link: (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(log._id, log.active);
            }}
            style={{
              textDecoration: "none",
            }}
          >
            {">"}
          </a>
        ),
      };
    });
  };

  useEffect(() => {
    const visitLogs = getCurrentPatientVisitLogs();
    console.log("Visit logs:", visitLogs);
    // Sort the logs from newest to oldest
    const sortedVisitLogs = sortVisitLogsByDateDesc(visitLogs);
    // Format the logs for display
    const formattedVisitLogs = formatVisitLogs(sortedVisitLogs);
    setVisistLogs(formattedVisitLogs);
  }, [patients, propUsername]);

  const handleAddPatient = async () => {
    if (propUsername) {
      const body = {
        patientId: getCurrentPatientId(),
        role: localStorage.getItem("role"),
      };
      try {
        const response = await request("/api/patients/visitLogs/default", {
          method: "POST",
          body: JSON.stringify(body),
        });

        console.log("POST response:", response);

        navigate(
          `/patient-visit?username=${encodeURIComponent(propUsername)}&visitLogId=${encodeURIComponent(response._id)}&active=${encodeURIComponent(response.active)}`,
        );
      } catch (error) {
        const err = error as Error;
        console.error("Error adding patient visit log:", err);
        alert(err.message || "Error adding patient visit log");
      }
    } else {
      navigate("/patient-visit");
    }
  };

  console.log(propUsername);

  return (
    <>
      {/* List of visit logs here */}
      <Box paddingX="32px">
        <Typography variant="h6" gutterBottom>
          Visits Log:
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e0e0e0", marginBottom: "16px" }}
        >
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                >
                  Location
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    padding: "12px 16px",
                    color: "#212121",
                  }}
                  align="right"
                >
                  Link
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitLogs.map((log, index) => (
                <TableRow
                  key={log.Date}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fafafa",
                    "&:last-child td": { borderBottom: 0 },
                    "&:hover": { backgroundColor: "#ececec" },
                  }}
                >
                  <TableCell sx={{ padding: "12px 16px", color: "#424242" }}>
                    {log.Date}
                  </TableCell>
                  <TableCell sx={{ padding: "12px 16px", color: "#424242" }}>
                    {log.Location}
                  </TableCell>
                  <TableCell
                    sx={{ padding: "12px 16px", color: "#424242" }}
                    align="right"
                  >
                    {log.Link}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Button to add a new patient visit log */}
      <Fab
        color="primary"
        aria-label="add-visit-log"
        onClick={handleAddPatient}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default VisitLogList;
