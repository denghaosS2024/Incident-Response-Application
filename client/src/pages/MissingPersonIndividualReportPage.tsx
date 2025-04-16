import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const MissingPersonIndividualReportPage: React.FC = () => {

  const nagivate = useNavigate(); 

  // Add function to invoke when "Add Follow-Up" Button is clicked 
  const addFollowUp = ( reportId: string ) => {
    nagivate(`/missing-person/followUp/${reportId}`);
  }

  return (
    <div>
      <h1>Missing Person Report</h1>
      <p>
        This page will show detailed information for a single missing person
        report.
      </p>
      {/* Add detailed report content here */}
      <Box display="flex" justifyContent="center" marginY={2} gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addFollowUp("123")}
          size="medium">
          Add Follow-Up
        </Button>
      </Box>
    </div>
  );
};

export default MissingPersonIndividualReportPage;
