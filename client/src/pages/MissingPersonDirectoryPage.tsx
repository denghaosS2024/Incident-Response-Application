import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Container,
  Fab,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import MissingPersonCard from "../components/feature/MissingPerson/MissingPersonInfoCard";
import IMissingPerson from "../models/MissingPersonReport";
import request, { IRequestError } from "../utils/request";

const MissingPersonDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState<IMissingPerson[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentUserRole = localStorage.getItem("role");

  // fetch on mount
  useEffect(() => {
    request<IMissingPerson[]>(
      "/api/missingPerson/report",
      { method: "GET" },
      false,
    )
      .then((data) => {
        setReports(data);
      })
      .catch((err) => {
        const error = err as IRequestError;
        setErrorMessage(error.message ?? "Failed to load reports");
      });
  }, []);

  // split into open/closed
  const openReports = reports.filter(
    (r) => r.reportStatus.toLowerCase() === "open",
  );
  const closedReports = reports.filter(
    (r) => r.reportStatus.toLowerCase() === "closed",
  );

  return (
    <Container maxWidth="md" sx={{ py: 4, position: "relative" }}>
      {/* Open Reports */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Open Reports
        </Typography>
        {openReports.length > 0 ? (
          openReports.map((p) => (
            <MissingPersonCard
              key={p._id}
              person={p}
              showAction
              onActionClick={() => navigate(`/missing-person/report/${p._id}`)}
            />
          ))
        ) : (
          <Typography>No open reports found.</Typography>
        )}
      </Box>

      {/* Closed Reports */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h6" gutterBottom>
          Closed Reports
        </Typography>
        {closedReports.length > 0 ? (
          closedReports.map((p) => (
            <MissingPersonCard key={p._id} person={p} showAction={false} />
          ))
        ) : (
          <Typography>No closed reports found.</Typography>
        )}
      </Box>

      {/* only show + if role is Police */}
      {currentUserRole === "Police" && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => navigate("/missing-person/register")}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          elevation={6}
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MissingPersonDirectoryPage;
