import AlertSnackbar from "@/components/common/AlertSnackbar";
import IFollowUpInfo from '@/models/FollowUpInfo';
import request from '@/utils/request';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Box, Button, Checkbox, Container, FormControlLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface FollowUpFormProps {
  reportId: string
  readonly: boolean
  followUpId?: string
}

const MissingPersonFollowUpForm: React.FC<FollowUpFormProps> = ({reportId, readonly, followUpId}) => {
  const navigate = useNavigate();

  const [physicallySeen, setPhysicallySeen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [openCamera, setOpenCamera] = useState(false);
  // const [openFileUpload, setOpenFileUpload] = useState(false);
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

  // Fetch existing follow-up info if in readonly mode
  useEffect(() => {
    if (readonly && followUpId) {
      const id = followUpId;
      request<IFollowUpInfo>(`/api/missing-person-followup/single/${id}`, { method: 'GET' }, false)
        .then((data) => {
          console.log(data)
          setPhysicallySeen(data.isSpotted);
          setLocation(data.locationSpotted ?? "");
          const date = new Date(data.datetimeSpotted);
          const pad = (n: number) => n.toString().padStart(2, '0');
          const localDateTime =
            date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + 'T' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes());
          setDateTime(localDateTime);
          setAdditionalComment(data.additionalComment ?? "");
        })
        .catch(() => {
          setSnackbarMessage("Failed to load follow-up data.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  }, [readonly, followUpId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  // const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  // };

  // const handelOpenCamera = () => {
  //   setOpenCamera(true);
  // };

  // const handelcCloseCamera = () => {
  //   setOpenCamera(false);
  // };

  // const handleOpenFileUpload = () => setOpenFileUpload(true);
  // const handleCloseFileUpload = () => setOpenFileUpload(false);

  const handleSubmit = async() => {
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
        locationSpotted: location,
        datetimeSpotted: new Date(dateTime),
        additionalComment: additionalComment
      }

      console.log(JSON.stringify(followUpInfo));

      const postResult = await request<IFollowUpInfo>(
        "/api/missing-person-followup/",
        {
          method: "POST",
          body: JSON.stringify(followUpInfo),
        },
        false,
      );
      if (postResult) {
        setSnackbarMessage("Follow-up submitted!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setTimeout(() => {
          setSnackbarOpen(false);
          navigate(-1);
        }, 2000);
        return;
      } else {
        setSnackbarMessage("Server Error on Follow-up submission");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
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
            disabled={readonly}
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
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={readonly}
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
        value={dateTime}
        onChange={(event) => setDateTime(event.target.value)}
        disabled={readonly}
      />
      <TextField
        label="Additional Comments"
        variant="outlined"
        fullWidth
        multiline
        minRows={3}
        // placeholder="Enter Any Additional Comment You May Have"
        onChange={(event)=> setAdditionalComment(event.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        value={additionalComment}
        disabled={readonly}
      />
      {!readonly && (
          <>
            <Box display="flex" alignItems="center" flexDirection="row" gap={1}>
              <Typography>Upload a Photo:</Typography>
              <IconButton color="primary" component="label" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                <AddPhotoAlternateIcon />
              </IconButton>
            </Box>

            {imageUrl && (
              <Box display="flex" flexDirection="column" mt={2}>
                <img src={imageUrl} alt="Preview" style={{ width: "auto", height: "auto" }} />
              </Box>
            )}
          </>
        )}

        {!readonly && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
          </Box>
        )}
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
