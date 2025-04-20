// src/pages/MissingPersonIndividualReportPage.tsx

import { Box, Button, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import MissingPersonCard from "../components/feature/MissingPerson/MissingPersonInfoCard";
import IMissingPerson from "../models/MissingPersonReport";
import request, { IRequestError } from "../utils/request";

const MissingPersonIndividualReportPage: React.FC = () => {
  const navigate = useNavigate();

  const addFollowUp = (reportId: string) => {
    navigate(`/missing-person/followUp/${reportId}`);
  };

  // get :reportId from URL
  const { reportId } = useParams<{ reportId: string }>();
  const [person, setPerson] = useState<IMissingPerson | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    request<IMissingPerson>(
      `/api/missingPerson/report?id=${reportId}`,
      { method: "GET" },
      false,
    )
      .then((data) => setPerson(data))
      .catch((err) => {
        const e = err as IRequestError;
        setErrorMessage(e.message ?? "Failed to load report");
      });
  }, [reportId]);

  // show error if fetch failed
  if (errorMessage) {
    return <Typography color="error">{errorMessage}</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* loading state */}
      {!person ? (
        <Typography>Loading report…</Typography>
      ) : (
        <>
          {/* top card with update arrow */}
          <MissingPersonCard
            person={person}
            showAction
            onActionClick={() =>
              navigate(`/missing-person/manage/${person._id}`)
            }
          />

          {/* Add Follow-Up button */}
          <Box display="flex" justifyContent="center" my={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => addFollowUp("123")}
            >
              Add Follow-Up
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default MissingPersonIndividualReportPage;
