import HospitalResourceCard from "@/components/feature/HospitalResources/HospitalResourceCard";
import { fetchAllHospitalResources } from "@/redux/hospitalResourceSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Box, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const HospitalResourcesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const groupedResources = useSelector(
    (state: RootState) => state.hospitalResourceState.hospitalResourceGroupedByResource,
  );
  const loading = useSelector(
    (state: RootState) => state.hospitalResourceState.loading,
  );

  // Local state for search term (UI only, no functionality yet)
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all hospital resources on component mount
  useEffect(() => {
    dispatch(fetchAllHospitalResources()); // Fetch all resources
  }, [dispatch]);

  return (
    <Box sx={{ padding: 2 }}>
      {/* Search Bar */}
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Search Resources"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // temp implamentation, will finish later
        />
      </Box>

      {/* Hospital Resources */}
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Hospital Resources
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) :  Object.keys(groupedResources).length > 0 ? (
        Object.entries(groupedResources).map(([resourceName, hospitals]) => (
          <HospitalResourceCard
            key={resourceName} // Use a unique key
            resourceName={resourceName} // Assuming hospitalId is the name or ID
            hospitals={hospitals} // Pass the resource as an array
            onRequest={(hospitalId:string, hospitalResourceId:string) =>
              navigate(`/hospital-resource-request/${hospitalId}/${hospitalResourceId}/add`)
            }
          />
        ))
      ) : (
        <Typography>No resources available.</Typography>
      )}
    </Box>
  );
};

export default HospitalResourcesPage;
// Compare this snippet from client/src/components/feature/HospitalResources/HospitalResourceCard.tsx:
