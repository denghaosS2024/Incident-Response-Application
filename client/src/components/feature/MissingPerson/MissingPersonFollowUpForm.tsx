import CameraCapture from '@/components/CameraCapture';
import AlertSnackbar from "@/components/common/AlertSnackbar";
import IFollowUpInfo from '@/models/FollowUpInfo';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Box, Button, Checkbox, Container, Dialog, FormControlLabel, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface FollowUpFormProps {
  reportId: string
}

const MissingPersonFollowUpForm: React.FC<FollowUpFormProps> = ({reportId}) => {
  const [physicallySeen, setPhysicallySeen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handelOpenCamera = () => {
    setOpenCamera(true);
  };

  const handelcCloseCamera = () => {
    setOpenCamera(false);
  };

  const handleOpenFileUpload = () => setOpenFileUpload(true);
  const handleCloseFileUpload = () => setOpenFileUpload(false);

  const handleSubmit = () => {
    if (physicallySeen && !location.trim() ) {
      setSnackbarMessage("Please fill out Location Spotted");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    } else if (!dateTime.trim()) {
      console.log(location);
      setSnackbarMessage("Please fill out Date & Time Spotted.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    } else {
      const followUpInfo: IFollowUpInfo = {
        reportId: reportId,
        isSpotted: physicallySeen ,
        location: location,
        dateTimeSpotted: new Date(dateTime),
        additionalComment: additionalComment
      }
      console.log(followUpInfo);
      console.log(JSON.stringify(followUpInfo));
    setSnackbarMessage("Follow-up submitted!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    return;
    }
  };
  

  
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
    <Stack spacing={2} mt={3}>
      <Typography variant="h5" gutterBottom>Follow-up Information</Typography>
      
      {/* should location not be the autofill thing?? */}
      <FormControlLabel
        control={
          <Checkbox
            checked={physicallySeen}
            onChange={(event) => setPhysicallySeen(event.target.checked)}
          />
        }
        label="Check if physically seen the person"
      />

      {physicallySeen && (
        <TextField
          label="Location Spotted"
          variant="outlined"
          fullWidth
          placeholder="Enter The Location Where You Spotted The Person"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => setLocation(e.target.value)}
        />
      )}
      <TextField
        label="Date & Time Spotted"
        type="datetime-local"
        name="date"
        variant="outlined"
        fullWidth
        placeholder='Please enter date of spotting or date of this follow-up'
        InputLabelProps={{
            shrink: true,
          }}
        onChange={(event) => setDateTime(event.target.value)}
      />
      <TextField
        label="Additional Comments"
        variant="outlined"
        fullWidth
        multiline
        minRows={3}
        // placeholder="Enter Any Additional Comment You May Have"
        onChange={(event)=> setAdditionalComment(event.target.value)}
      />
      
      <Box display="flex" alignItems="center" flexDirection="row" marginY={2} gap={1}>
      <Box sx={{ width: 5 }} />
        <Typography>Upload a Photo:</Typography>
        <IconButton color="primary" component="label" onClick={handleMenuOpen}>
            <input hidden accept="image/*" type="file" id="upload-photo" onChange={handleImageChange} />
            <AddPhotoAlternateIcon />
        </IconButton>
        
        <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Existing attachment options can go here */}
        <MenuItem onClick={handelOpenCamera}>Take Photo</MenuItem>

        <MenuItem onClick={handleOpenFileUpload}>File Upload</MenuItem>
      </Menu>

      <Dialog
        open={openCamera}
        onClose={handelcCloseCamera}
        maxWidth="sm"
        fullWidth
      >
        <CameraCapture channelId="" currentUserId="" />
      </Dialog>
      

      {/* <Dialog open={openFileUpload} onClose={handleCloseFileUpload}>
        <FileUploadForm onClose={handleCloseFileUpload} channelId={channelId} />
      </Dialog> */}
      
        {/* <CameraCapture channelId="" currentUserId="" /> */}
        </Box>
        {imageUrl && (
        <Box display="flex" flexDirection="column" marginY={2} gap={1}>
          <img
            src={imageUrl}
            alt={selectedImage ? selectedImage.name : "Preview"}
            style={{ width: "auto", height: "auto", display: "block" }}
          />
        </Box>
      )}

      
        <Box display="flex" alignItems="center" flexDirection="column" marginY={2} gap={2}>
            
            <Button variant="contained" color="primary" size="medium" onClick={handleSubmit}>
            Submit
            </Button>
        </Box>
    </Stack>
    <AlertSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
        vertical="bottom"
        horizontal="center"
      />
    </Container>
  );

};

export default MissingPersonFollowUpForm;
