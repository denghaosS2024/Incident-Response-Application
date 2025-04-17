import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import IMissingPerson, {
  Gender,
  Race,
} from "../../../models/MissingPersonReport";

export interface MissingPersonFormProps {
  /** Optional initial values for editing */
  initialData?: IMissingPerson;
  /** Called when the form is submitted */
  onSubmit: (data: IMissingPerson) => void;
  /** Called when the form is cancelled/reset (optional) */
  onCancel?: () => void;
  readonly: boolean;
}

export const MissingPersonForm: React.FC<MissingPersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readonly
}) => {
  const initialFormState: IMissingPerson = {
    _id: undefined,
    name: "",
    age: 0,
    weight: undefined,
    height: undefined,
    race: Race.White,
    eyeColor: "",
    gender: Gender.Male,
    description: "",
    dateLastSeen: new Date(),
    locationLastSeen: "",
    photo: "",
    reportStatus: "open",
    ...initialData,
  };

  const [formData, setFormData] = useState<IMissingPerson>(initialFormState);

  // Handle text field changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "age" || name === "weight" || name === "height"
          ? Number(value)
          : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sync external initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialFormState });
    }
  }, [initialData]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
      {readonly
        ? "Original Report"
        : initialData
          ? "Edit Missing Person"
          : "Register Missing Person"}
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}
        noValidate
      >
        <Grid container spacing={2}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              required
              name="name"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Age */}
          <Grid item xs={12}>
            <TextField
              required
              name="age"
              label="Age"
              type="number"
              fullWidth
              value={formData.age}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Weight */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="weight"
              label="Weight (lbs)"
              type="number"
              fullWidth
              value={formData.weight ?? ""}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Height */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="height"
              label="Height (cm)"
              type="number"
              fullWidth
              value={formData.height ?? ""}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Race */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={readonly}>
              <InputLabel id="race-label">Race</InputLabel>
              <Select
                required
                labelId="race-label"
                name="race"
                value={formData.race}
                label="Race"
                onChange={handleSelectChange}
                disabled={readonly}
              >
                {Object.values(Race).map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Eye Color */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="eyeColor"
              label="Eye Color"
              fullWidth
              value={formData.eyeColor}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={readonly}>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                required
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                label="Gender"
                onChange={handleSelectChange}
                disabled={readonly}
              >
                {Object.values(Gender).map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Date Last Seen */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              name="dateLastSeen"
              label="Date Last Seen"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dateLastSeen.toISOString().split("T")[0]}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Location Last Seen */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="locationLastSeen"
              label="Location Last Seen"
              fullWidth
              value={formData.locationLastSeen}
              onChange={handleInputChange}
              disabled={readonly}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} container spacing={2} justifyContent="flex-end">
            {onCancel && (
              <Grid item>
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
              </Grid>
            )}
            {!readonly && (
              <Grid item>
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
