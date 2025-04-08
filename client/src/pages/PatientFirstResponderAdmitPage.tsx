import PatientForm from "@/components/feature/Reach911/PatientForm";
import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import ROLES from "../utils/Roles";

const PatientFirstResponderAdmitPage: React.FC = () => {
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");

  // Ensure only Fire or Police (First Responders) can access this page
  useEffect(() => {
    if (userRole !== ROLES.FIRE && userRole !== ROLES.POLICE) {
      navigate("/");
    }
  }, [userRole, navigate]);

  return (
    <Box sx={{ height: "100%", padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        New Patient
      </Typography>
      <PatientForm />
    </Box>
  );
};

export default PatientFirstResponderAdmitPage;
