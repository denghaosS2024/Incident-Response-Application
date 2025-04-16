import { Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import { MissingPersonForm } from "../components/feature/MissingPerson/missingPersonForm";
import IMissingPerson from "../models/MissingPersonReport";

const MissingPersonRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: IMissingPerson) => {
    console.log("POST /missing-person/register", data);
    // TODO: await api.post("/missing-person/register", data);
    navigate("/missing-person/directory");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box>
      <MissingPersonForm
        onSubmit={handleSubmit}
        onCancel={handleCancel} // omit this line if you don't want Cancel
      />
    </Box>
  );
};

export default MissingPersonRegisterPage;
