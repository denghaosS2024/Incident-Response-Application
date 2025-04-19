// src/pages/MissingPersonRegisterPage.tsx

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Box, Container, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MissingPersonForm } from "../components/feature/MissingPerson/MissingPersonForm";
import IMissingPerson from "../models/MissingPersonReport";

const PLACEHOLDER = "/images/placeholder.png";

const MissingPersonRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(PLACEHOLDER);

  useEffect(() => {
    if (!photoFile) {
      setPreviewSrc(PLACEHOLDER);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPreviewSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const handleSubmit = async (data: IMissingPerson) => {
    let photoUrl: string | undefined;
    if (photoFile) {
      // TODO: upload photoFile → photoUrl
      photoUrl = previewSrc;
    }

    const payload: IMissingPerson = { ...data, photo: photoUrl };
    try {
      const resp = await fetch("/missingPerson/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error("API error");
      navigate("/missing-person/directory");
    } catch (err) {
      console.error("Failed to save missing person:", err);
    }
  };

  const handleCancel = () => {
    setPhotoFile(null);
    setFormKey((k) => k + 1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Centered Title */}
      <Typography variant="h4" align="center" gutterBottom>
        Register Missing Person
      </Typography>

      {/* Centered Preview Image */}
      <Box
        component="img"
        src={previewSrc}
        alt="Missing person preview"
        sx={{
          width: 160,
          height: 160,
          objectFit: "cover",
          borderRadius: 2,
          mb: 2,
          display: "block",
          mx: "auto",
        }}
      />

      {/* Photo Upload Icon */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" sx={{ mr: 1 }}>
          Upload a Photo:
        </Typography>
        <IconButton color="primary" component="label" aria-label="upload photo">
          <PhotoCameraIcon />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </IconButton>
        {photoFile && (
          <Typography variant="body2" sx={{ ml: 2 }}>
            {photoFile.name}
          </Typography>
        )}
      </Box>

      {/* Reusable Form */}
      <Box key={formKey}>
        <MissingPersonForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          readonly={false}
        />
      </Box>
    </Container>
  );
};

export default MissingPersonRegisterPage;
