// src/pages/MissingPersonIndividualReportPage.tsx

import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import IFollowUpInfo from "@/models/FollowUpInfo";
import { NavigateNext as Arrow } from "@mui/icons-material";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
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
  const [followUps, setFollowUps] = useState<IFollowUpInfo[]>([]);


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

    request<IFollowUpInfo[]>(
      `/api/missing-person-followup/report/${reportId}`
    )
    .then((data) => {
      console.log("followups",data);
      setFollowUps(data)})
    .catch((err) => {
      const e = err as IRequestError;
      setErrorMessage(e.message ?? "Failed to load followups");
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
          {/* List all followups in chronological order*/}
          <GenericItemizeContainer
            items={followUps}
            key="Previous Follow-Up Information"
            getKey={(followUp: IFollowUpInfo): string =>
              followUp._id!
            }
            showHeader={false}
            title={`Previous Follow-Up Information`}
            emptyMessage="No Follow-Ups available"
            columns={[
              {
                key: "locationSpotted",
                align: "left",
                label: "Location Spotted",
                render: (item) => (
                  <Box sx={{ wordBreak: 'break-word' }}>
                    <Typography variant="body1">
                      Spotted at: {item.locationSpotted !== "" ? item.locationSpotted : "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date Reported: {new Date(item.datetimeSpotted).toLocaleDateString()}
                    </Typography>
                  </Box>
                ),
              },
              {
                key: "_id",
                align: "center",
                label: "",
                width: 65,
                render: (followUp) => (
                  <IconButton
                    edge="end"
                    size="large"
                    onClick={() =>
                      navigate(`/missing-person/followUp/${followUp.reportId}?readonly=true&followUpId=${followUp._id}`)
                    }
                  >
                    <Arrow />
                  </IconButton>
                ),
              },
            ]}
          />
          {/* Add Follow-Up button */}
          <Box display="flex" justifyContent="center" my={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => addFollowUp(reportId!)}
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
