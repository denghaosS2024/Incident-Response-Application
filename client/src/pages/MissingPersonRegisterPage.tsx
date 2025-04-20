import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Alert,
  Box,
  Container,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MissingPersonForm } from "../components/feature/MissingPerson/MissingPersonForm";
import IMissingPerson from "../models/MissingPersonReport";
import request, { IRequestError } from "../utils/request";

const PLACEHOLDER = "/images/placeholder.png";

const MissingPersonRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(PLACEHOLDER);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await request<IMissingPerson>(
        "/api/missingPerson/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        false,
      );

      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        navigate("/missing-person/directory");
      }, 2000);
    } catch (err) {
      const error = err as IRequestError;
      console.error(
        `Failed to save missing person (status ${error.status}): ${error.message}`,
      );
      setErrorMessage(error.message ?? "Unknown error");
    }
  };

  const handleCancel = () => {
    setPhotoFile(null);
    setFormKey((k) => k + 1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Title */}
      <Typography variant="h4" align="center" gutterBottom>
        Register Missing Person
      </Typography>

      {/* Preview */}
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

      {/* Photo Upload */}
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
            ref={fileInputRef}
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

      {/* Form */}
      <Box key={formKey}>
        <MissingPersonForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          readonly={false}
        />
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" elevation={6} variant="filled">
          Missing Person registered successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          elevation={6}
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MissingPersonRegisterPage;
