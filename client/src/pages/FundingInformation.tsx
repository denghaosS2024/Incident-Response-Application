import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";

const FundingInformation: React.FC = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams<{ incidentId: string }>();
  console.log(incidentId);
  const [alreadyAssignedFunding, setAlreadyAssignedFunding] = useState<number>(0);
  const [requestedFunding, setRequestedFunding] = useState<number>(0);
  const [fundingLeft, setFundingLeft] = useState<number>(0);

  useEffect(() => {
    const fetchFundingData = async () => {
        const incidents = await request(
            `/api/incidents/?incidentId=${incidentId}`,
            { method: "GET" }
          );
        const incident = incidents[0];

        setAlreadyAssignedFunding(incident.fund_assigned ? incident.fund_assigned : 0);
        setRequestedFunding(incident.fund_requested ? incident.fund_requested : 0);
        setFundingLeft(incident.fund_left ? incident.fund_left : 0);
    }

    fetchFundingData();
  }, [incidentId]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      minHeight="100vh"
      pt={10}
    >
      <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
        <Typography textAlign="left">
          Amount of already assigned: ${alreadyAssignedFunding.toLocaleString()}
        </Typography>
        <Typography textAlign="left">
          Amount of requested funding: ${requestedFunding.toLocaleString()}
        </Typography>
        <Typography textAlign="left">
          Amount of funding left: ${fundingLeft.toLocaleString()}
        </Typography>
      </Box>

      <Stack spacing={2} mt={4}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#66B2FF" }}
          onClick={() =>
            navigate("/reach911", {
              state: { incidentId },
            })
          }
        >
          Incident Details
        </Button>
        <Button
          variant="contained"
          style={{ backgroundColor: "#FF9999" }}
          onClick={() => navigate("/funding-history")}
        >
          Funding History
        </Button>
      </Stack>
    </Box>
  );
};

export default FundingInformation;
