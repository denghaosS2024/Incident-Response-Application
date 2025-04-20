import FileUploadIcon from "@mui/icons-material/FileUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import IMissingPerson, { Gender, Race } from "../models/MissingPersonReport";
import request, { IRequestError } from "../utils/request";

const MissingPersonManagePage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  // State for form data and UI controls
  const [formData, setFormData] = useState<IMissingPerson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the missing person data
  useEffect(() => {
    if (!reportId) {
      setError("No report ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);

    request<IMissingPerson>(
      `/api/missingPerson/report?id=${reportId}`,
      { method: "GET" },
      false,
    )
      .then((data) => {
        console.log("Fetched missing person data:", data);
        setFormData(data);
        setLoading(false);
      })
      .catch((err: IRequestError) => {
        console.error("Error fetching missing person data:", err);
        setError(err.message ?? "Failed to load missing person data");
        setLoading(false);
      });
  }, [reportId]);

  // Handle form submission (update)
  const handleUpdate = async (updatedData: IMissingPerson) => {
    try {
      setLoading(true);
      const payload = {
        ...updatedData,
        reportStatus: "open", // Always maintain open status on regular update
      };

      // Make API call to update the record using the request utility
      const updateUrl = `/api/missingPerson/${reportId}`;
      console.log("Updating missing person with URL:", updateUrl);

      await request<IMissingPerson>(
        updateUrl,
        {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        },
        false,
      );

      console.log("Update successful!");

      // Navigate to the report page after successful update
      navigate(`/missing-person/report/${reportId}`);
    } catch (err) {
      const e = err as IRequestError;
      console.error("Error updating missing person:", e);
      setError(e.message ?? "Failed to update missing person record");
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as found
  const handleMarkAsFound = async () => {
    if (!formData) return;

    try {
      setLoading(true);

      // Create the payload with closed report status
      const payload = {
        ...formData,
        reportStatus: "closed"
      };

      // Make API call to update the record using the request utility
      await request<IMissingPerson>(
        `/api/missingPerson/${reportId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        },
        false,
      );

      console.log("Successfully marked as found");

      // Navigate to the directory after successfully marking as found
      navigate(`/missing-person/directory`);
    } catch (err) {
      const e = err as IRequestError;
      console.error("Error marking person as found:", e);
      setError(e.message ?? "Failed to mark person as found");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate(`/missing-person/report/${reportId}`);
  };

  // Handle file upload for photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (!formData) return;
      // Store the image as a base64 string
      setFormData({
        ...formData,
        photo: reader.result as string
      });
    };
    
    reader.readAsDataURL(file);
  };

  // Handle Generate PDF
  const handleGeneratePDF = () => {
    if (!formData) return;
    
    // Use window.print for a simple approach that works without additional libraries
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to generate PDF');
      return;
    }
    
    // Format date for display
    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString();
    };
    
    // Generate HTML content for the PDF
    const content = `
      <html>
        <head>
          <title>Missing Person Report: ${formData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .report-container { max-width: 800px; margin: 0 auto; }
            .photo-container { text-align: center; margin: 20px 0; }
            .photo { max-width: 300px; max-height: 300px; }
            .data-row { margin: 10px 0; }
            .label { font-weight: bold; }
            h1 { color: #2c3e50; }
            .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
            .status-open { background-color: #e74c3c; color: white; }
            .status-closed { background-color: #27ae60; color: white; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1>Missing Person Report</h1>
              <div class="status ${formData.reportStatus === 'open' ? 'status-open' : 'status-closed'}">
                Status: ${formData.reportStatus === 'open' ? 'Missing' : 'Found'}
              </div>
            </div>
            
            <div class="photo-container">
              ${formData.photo ? 
                `<img src="${formData.photo}" alt="${formData.name}" class="photo" />` : 
                '<p>No photo available</p>'}
            </div>
            
            <div class="data-row"><span class="label">Name:</span> ${formData.name}</div>
            <div class="data-row"><span class="label">Age:</span> ${formData.age}</div>
            <div class="data-row"><span class="label">Gender:</span> ${formData.gender}</div>
            <div class="data-row"><span class="label">Race:</span> ${formData.race}</div>
            ${formData.height ? `<div class="data-row"><span class="label">Height:</span> ${formData.height}</div>` : ''}
            ${formData.weight ? `<div class="data-row"><span class="label">Weight:</span> ${formData.weight} lbs</div>` : ''}
            ${formData.eyeColor ? `<div class="data-row"><span class="label">Eye Color:</span> ${formData.eyeColor}</div>` : ''}
            <div class="data-row"><span class="label">Date Last Seen:</span> ${formatDate(formData.dateLastSeen)}</div>
            ${formData.locationLastSeen ? `<div class="data-row"><span class="label">Location Last Seen:</span> ${formData.locationLastSeen}</div>` : ''}
            
            ${formData.description ? 
              `<div class="data-row">
                <span class="label">Description:</span>
                <p>${formData.description}</p>
              </div>` : ''}
            
            <div class="data-row">
              <span class="label">Report ID:</span> ${formData._id}
            </div>
            
            <div class="data-row">
              <p>This report was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for the content to load then print
    setTimeout(() => {
      printWindow.print();
      // Keep the window open until the print dialog is closed
    }, 500);
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  if (!formData) {
    return (
      <Typography variant="h6">Missing person record not found</Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 800, mx: "auto" }}>
      <Grid container spacing={3}>
        {/* Main form content */}
        <Grid item xs={12}>
          {formData && (
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Avatar and image section */}
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Avatar
                    src={formData.photo}
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "grey.500"
                    }}
                  >
                    {!formData.photo && <QuestionMarkIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                </Grid>
                <Grid item xs={8}>
                  {/* Name field */}
                  <InputLabel
                    sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Name
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    InputLabelProps={{ shrink: false }}
                  />
                  
                  {/* Age field */}
                  <Box sx={{ mt: 2 }}>
                    <InputLabel
                      sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                    >
                      Age
                    </InputLabel>
                    <TextField
                      type="number"
                      fullWidth
                      variant="outlined"
                      value={formData.age}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, age: Number(e.target.value) })
                      }
                      InputLabelProps={{ shrink: false }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Two column layout for Weight and Height */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Weight
                  </InputLabel>
                  <TextField
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.weight || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    InputLabelProps={{ shrink: false }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Height
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={
                      formData.height !== undefined && typeof formData.height === "number"
                        ? `${Math.floor(formData.height / 12)}'${formData.height % 12}`
                        : ""
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      // Parse the height input - either convert to inches or keep existing value
                      let heightValue: number | undefined = undefined;
                      
                      if (e.target.value) {
                        // Try to parse feet and inches format (e.g. "5'7")
                        const feetInchMatch = e.target.value.match(/(?<feet>\d+)'(?<inches>\d+)/);
                        if (feetInchMatch?.groups) {
                          const feet = parseInt(feetInchMatch.groups.feet);
                          const inches = parseInt(feetInchMatch.groups.inches);
                          heightValue = feet * 12 + inches;
                        } else {
                          // If it's just a number, try to parse it directly
                          const parsedHeight = parseInt(e.target.value);
                          if (!isNaN(parsedHeight)) {
                            heightValue = parsedHeight;
                          }
                        }
                      }
                      
                      setFormData({
                        ...formData,
                        height: heightValue,
                      });
                    }}
                    placeholder="e.g., 5'7"
                    InputLabelProps={{ shrink: false }}
                  />
                </Grid>
              </Grid>

              {/* Race - Full width */}
              <InputLabel
                sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
              >
                Race
              </InputLabel>
              <FormControl fullWidth variant="outlined">
                <Select
                  value={formData.race}
                  onChange={(e: SelectChangeEvent) =>
                    setFormData({
                      ...formData,
                      race: e.target.value as Race,
                    })
                  }
                  displayEmpty
                  inputProps={{ "aria-label": "Race" }}
                >
                  {Object.values(Race).map((race) => (
                    <MenuItem key={race} value={race}>
                      {race}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Two column layout for Eye color and Gender */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Eye color
                  </InputLabel>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={formData.eyeColor || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, eyeColor: e.target.value })
                    }
                    InputLabelProps={{ shrink: false }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <InputLabel
                    sx={{ mb: 1, color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Gender
                  </InputLabel>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={formData.gender}
                      onChange={(e: SelectChangeEvent) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as Gender,
                        })
                      }
                      displayEmpty
                      inputProps={{ "aria-label": "Gender" }}
                    >
                      {Object.values(Gender).map((gender) => (
                        <MenuItem key={gender} value={gender}>
                          {gender}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* Description - Full width */}
              <InputLabel
                sx={{ mb: 1, mt: 1, color: "text.secondary", fontSize: "0.75rem" }}
              >
                Description
              </InputLabel>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.description || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                InputLabelProps={{ shrink: false }}
              />

              {/* Upload photo and Mark as found row */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 3, mb: 2 }}>
                <Typography sx={{ mr: 2 }}>Upload a New Photo:</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadIcon />}
                  size="small"
                >
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoUpload}
                  />
                </Button>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleGeneratePDF}
                  sx={{ mr: 2 }}
                >
                  GENERATE PDF
                </Button>
              </Box>
              
              {/* Removed mark as found checkbox as per requirements */}
              
              {/* Action buttons row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ minWidth: 100 }}
                >
                  CANCEL
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (formData) handleUpdate(formData);
                  }}
                  sx={{ minWidth: 100 }}
                >
                  UPDATE
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={handleMarkAsFound}
                  disabled={formData.reportStatus?.toLowerCase() !== "open"}
                  sx={{ minWidth: 100 }}
                >
                  FOUND
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MissingPersonManagePage;
