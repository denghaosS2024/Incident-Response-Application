import React, { useEffect, useState, ChangeEvent } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  FormControlLabel,
  Checkbox,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import IMissingPerson, { Gender, Race } from "../models/MissingPersonReport";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import request, { IRequestError } from "../utils/request";

const MissingPersonManagePage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  // State for form data and UI controls
  const [formData, setFormData] = useState<IMissingPerson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkedAsFound, setIsMarkedAsFound] = useState<boolean>(false);

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
        reportStatus: isMarkedAsFound ? "closed" : "open"
      };
      
      // Make API call to update the record using the request utility
      const updateUrl = `/api/missingPerson/${reportId}`;
      console.log('Updating missing person with URL:', updateUrl);
      
      await request<IMissingPerson>(
        updateUrl,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
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
  const handleFound = async () => {
    if (!formData) return;
    
    try {
      setLoading(true);
      
      // Make API call to mark as found using the request utility
      await request(
        `/api/missingPerson/${reportId}/found`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportStatus: "closed" }),
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
  const handlePhotoUpload = () => {
    // This is just a placeholder for the actual photo upload functionality
    console.log("Photo upload functionality would be implemented here");
    alert("Photo upload functionality would be implemented here");
  };
  
  // Handle Generate PDF
  const handleGeneratePDF = () => {
    // This is just a placeholder for the actual PDF generation functionality
    console.log("PDF generation functionality would be implemented here");
    alert("PDF generation functionality would be implemented here");
  };

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!formData) {
    return <Typography variant="h6">Missing person record not found</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Manage Missing Person Report
      </Typography>
      
      <Grid container spacing={3}>
        {/* Photo/Avatar section */}
        <Grid item xs={12} sm={4} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar
            sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: "grey.500",
              mb: 2 
            }}
          >
            <QuestionMarkIcon sx={{ fontSize: 60 }} />
          </Avatar>
          
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handlePhotoUpload}
            size="small"
          >
            Upload a New Photo
          </Button>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleGeneratePDF}
              fullWidth
              sx={{ mb: 2 }}
            >
              GENERATE PDF
            </Button>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isMarkedAsFound}
                  onChange={(e) => setIsMarkedAsFound(e.target.checked)}
                />
              }
              label="Mark Person as Found"
            />
          </Box>
        </Grid>
        
        {/* Form section */}
        <Grid item xs={12} sm={8}>
          {formData && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Age"
                    type="number"
                    fullWidth
                    value={formData.age}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, age: Number(e.target.value)})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Weight (in Pounds)"
                    type="number"
                    fullWidth
                    value={formData.weight || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, weight: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Height"
                    fullWidth
                    value={formData.height !== undefined ? (typeof formData.height === 'number' ? `${Math.floor(formData.height / 12)}'${formData.height % 12}` : formData.height) : ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, height: Number(e.target.value) || formData.height})}
                    placeholder="e.g., 5'7"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="race-label">Race</InputLabel>
                    <Select
                      labelId="race-label"
                      value={formData.race}
                      label="Race"
                      onChange={(e: SelectChangeEvent) => setFormData({...formData, race: e.target.value as Race})}
                    >
                      {Object.values(Race).map((race) => (
                        <MenuItem key={race} value={race}>{race}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Eye Color"
                    fullWidth
                    value={formData.eyeColor || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, eyeColor: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      value={formData.gender}
                      label="Gender"
                      onChange={(e: SelectChangeEvent) => setFormData({...formData, gender: e.target.value as Gender})}
                    >
                      {Object.values(Gender).map((gender) => (
                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, description: e.target.value})}
                  />
                </Grid>
              </Grid>
              
              {/* Action buttons */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                >
                  CANCEL
                </Button>
                
                {isMarkedAsFound && (
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={handleFound}
                  >
                    FOUND
                  </Button>
                )}
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    if (formData) handleUpdate(formData);
                  }}
                >
                  UPDATE
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
