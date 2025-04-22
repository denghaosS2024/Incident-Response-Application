import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useDispatch } from "react-redux";
import { updateIncident } from "../redux/incidentSlice";
import SocketClient from "../utils/Socket";

const FundingInformation: React.FC = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams<{ incidentId: string }>();
  console.log(incidentId);
  // const [alreadyAssignedFunding, setAlreadyAssignedFunding] = useState<number>(0);
  // const [requestedFunding, setRequestedFunding] = useState<number>(0);
  // const [fundingLeft, setFundingLeft] = useState<number>(0);
  const i = useSelector((state: RootState) => state.incidentState.incident);
  console.log(i);
  let fund_assigned = useSelector(
    (state: RootState) => state.incidentState.incident.fund_assigned,
  );

  if (!fund_assigned) {
    fund_assigned = 0;
  }
  // const fund_requested = useSelector((state: RootState) => state.incidentState.incident.fund_requested);
  let fund_left = useSelector(
    (state: RootState) => state.incidentState.incident.fund_left,
  );

  if (!fund_left) {
    fund_left = 0;
  }
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFundingData = async () => {
      const incidents = await request(
        `/api/incidents/?incidentId=${incidentId}`,
        { method: "GET" },
      );
      const incident = incidents[0];
      dispatch(updateIncident(incident));
      // setAlreadyAssignedFunding(incident.fund_assigned ? incident.fund_assigned : 0);
      // setRequestedFunding(
      //   incident.fund_requested ? incident.fund_requested : 0,
      // );
      // setFundingLeft(incident.fund_left ? incident.fund_left : 0);
    };

    fetchFundingData();

    const socket = SocketClient;

    socket.on("incidentFundingUpdated", () => {
      fetchFundingData();
    });

    return () => {
      socket.off("incidentFundingUpdated");
    };
  }, [incidentId, dispatch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      minHeight="100vh"
      pt={10}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap={1}
      >
        <Typography textAlign="left">
          Amount of already assigned: ${fund_assigned.toLocaleString()}
        </Typography>

        <Typography textAlign="left">
          Amount of funding left: ${fund_left.toLocaleString()}
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
          onClick={() => navigate(`/chief-funding-history/${incidentId}`)}
        >
          Funding History
        </Button>
      </Stack>
    </Box>
  );
};

export default FundingInformation;
