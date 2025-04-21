import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Alert,
  Box,
  Container,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MissingPersonForm } from "../components/feature/MissingPerson/MissingPersonForm";
import IMissingPerson from "../models/MissingPersonReport";
import request, { IRequestError } from "../utils/request";

const PLACEHOLDER = "/images/placeholder.png";

const MissingPersonRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [photoFile, setPhotoFile] = useState<string>("");
  const [previewSrc, setPreviewSrc] = useState<string>(PLACEHOLDER);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPreviewSrc(PLACEHOLDER);
      return;
    }
    setPreviewSrc(photoFile);
  }, [photoFile]);

  // Function to convert HEIC to JPG
  async function convertHEICToJPG(heicFile: File | Blob) {
    try {
      const blobs = await heic2any({
        blob: heicFile,
        toType: 'image/jpeg',
      });
      const blob = Array.isArray(blobs) ? blobs[0] : blobs;
      
      const jpgURL = URL.createObjectURL(blob);
      return jpgURL;
    } catch (error) {
      console.error('Error converting HEIC to JPG:', error);
      return null;
    }
  }
  // Handle file upload for photo
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const maxSize = 16 * 1024 * 1024; // 16MB in bytes

    // if the file exceeds the 16MB size limit
    if (file.size > maxSize) {
      alert("The file is too large. Please select a file smaller than 16MB.");
      return;
    }

     // if HEIC iphone image, convert it to JPG 
    if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
      const jpgURL = await convertHEICToJPG(file);
      if (!jpgURL) {
        alert("Error converting HEIC to JPG. Please try again with a different file.");
        return;
      }

      setPhotoFile(jpgURL)
      return; 
    }

  try {
    const options = {
      maxWidthOrHeight: 800,  
      useWebWorker: true,
    };

    // compress the image
    const compressedFile = await imageCompression(file, options);
    const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

    setPhotoFile(base64 ?? null)

    } catch (error) {
      console.error("Error compressing the image:", error);
    }
  };

  const handleSubmit = async (data: IMissingPerson) => {
    let photoUrl: string | undefined;
    if (photoFile) {
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
    setPhotoFile("");
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
            onChangeCapture={handlePhotoUpload}
          />
        </IconButton>
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
