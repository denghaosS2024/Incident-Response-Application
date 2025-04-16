import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Stack, TextField, Typography } from '@mui/material';
import React from 'react';

interface FollowUpFormProps {
}

const MissingPersonFollowUpForm: React.FC<FollowUpFormProps> = () => {
  return (
    <Stack spacing={2} mt={3}>
      <Typography variant="h6">Original Report</Typography>
      <Typography variant="h6">Follow-up Information</Typography>

      
      {/* should location not be the autofill thing?? */}
      <TextField
        label="Location Spotted"
        variant="outlined"
        fullWidth
        placeholder="Enter The Location Which You Spotted The Person"
        InputLabelProps={{
            shrink: true,
          }}
      />
      <TextField
        label="Date"
        type="date"
        name="date"
        variant="outlined"
        fullWidth
        placeholder='Please enter date of spotting or date of this follow-up'
        InputLabelProps={{
            shrink: true,
          }}
      />
      <TextField
        label="Time"
        type="time"
        name="time"
        variant="outlined"
        fullWidth
        placeholder='Please enter time of spotting or time of this follow-up'
        InputLabelProps={{
            shrink: true,
          }}
      />
      <TextField
        label="Additional Comments"
        variant="outlined"
        fullWidth
        multiline
        minRows={3}
        // placeholder="Enter Any Additional Comment You May Have"
      />
      
      <FormControlLabel
        control={<Checkbox/>}
        label="Check if physically seen the person"
      />
      <Box display="flex" alignItems="center" flexDirection="row" marginY={2} gap={1}>
      <Box sx={{ width: 5 }} />
        <Typography>Upload a Photo:</Typography>
        <IconButton color="primary" component="label">
            <input hidden accept="image/*" type="file" id="upload-photo" />
            <PhotoCamera />
        </IconButton>
        </Box>
      
        <Box display="flex" alignItems="center" flexDirection="column" marginY={2} gap={2}>
            
            <Button variant="contained" color="primary" size="medium">
            Submit
            </Button>
        </Box>
    </Stack>
  );
};

export default MissingPersonFollowUpForm;
