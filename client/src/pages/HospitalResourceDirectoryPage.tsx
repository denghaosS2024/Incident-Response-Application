import HospitalResourceCard from "@/components/feature/HospitalResources/HospitalResourceCard";
import HospitalResource from "@/models/HospitalResource";
import { fetchAllHospitalResources } from "@/redux/hospitalResourceSlice";
import { AppDispatch, RootState } from "@/redux/store";
import request from "@/utils/request";
import { Box, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const HospitalResourcesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const groupedResources = useSelector(
    (state: RootState) =>
      state.hospitalResourceState.hospitalResourceGroupedByResource,
  );
  const loading = useSelector(
    (state: RootState) => state.hospitalResourceState.loading,
  );

  // Local state for search term (UI only, no functionality yet)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentHospitalId, setCurrentHospitalId] = useState<string | null>(
    null,
  );

  // Fetch all hospital resources on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = localStorage.getItem("uid");
        const role = localStorage.getItem("role"); // Get the role from localStorage
        if (role !== "Nurse") {
          console.error("User is not a nurse, redirecting to home page");
          navigate("/"); // Redirect to home page if the user is not a nurse
          return;
        }
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }

        const user = await request(`/api/users/${userId}`, { method: "GET" });
        setCurrentHospitalId(user.hospitalId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
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

      {loading ? (
        <Typography>Loading...</Typography>
      ) : Object.keys(groupedResources).length > 0 ? (
        Object.entries(groupedResources).map(([resourceName, hospitals]) => {
          const filteredHospitals = hospitals.filter(
            (hospital: HospitalResource) =>
              hospital.hospitalId._id !== currentHospitalId,
          );

          if (filteredHospitals.length === 0) {
            return <Typography>No resources available.</Typography>;
          }

          return (
            <HospitalResourceCard
              key={resourceName}
              resourceName={resourceName}
              hospitals={filteredHospitals}
              onRequest={(hospitalResourceId: string) =>
                navigate(
                  `/hospital-resource-request/${currentHospitalId}/${hospitalResourceId}/add`,
                )
              }
            />
          );
        })
      ) : (
        <Typography>No resources available.</Typography>
      )}
    </Box>
  );
};

export default HospitalResourcesPage;
// Compare this snippet from client/src/components/feature/HospitalResources/HospitalResourceCard.tsx:
