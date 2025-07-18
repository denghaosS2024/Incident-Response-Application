import { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { AddressAutofill } from "@mapbox/search-js-react";
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
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import IMissingPerson, {
  Gender,
  Race,
} from "../../../models/MissingPersonReport";
import Globals from "../../../utils/Globals";

const today = new Date().toISOString().split("T")[0];

export interface MissingPersonFormProps {
  /** Optional initial values for editing */
  initialData?: IMissingPerson;
  /** Called when the form is submitted */
  onSubmit: (data: IMissingPerson) => void;
  /** Called when the form is cancelled/reset (optional) */
  onCancel?: () => void;
  /** If true, fields are read‑only and no submit button */
  readonly: boolean;
}

export const MissingPersonForm: React.FC<MissingPersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readonly,
}) => {
  const initialFormState: IMissingPerson = {
    _id: undefined,
    name: "",
    age: 0,
    weight: undefined,
    height: undefined,
    race: "" as any, // ← blank
    eyeColor: "",
    gender: "" as any, // ← blank
    description: "",
    dateLastSeen: new Date(),
    locationLastSeen: "",
    photo: "",
    reportStatus: "open",
    personStatus: "missing",
    ...initialData,
  };

  const [formData, setFormData] = useState<IMissingPerson>(initialFormState);
  const [localAddress, setLocalAddress] = useState(formData.locationLastSeen);

  useEffect(() => {
    setLocalAddress(formData.locationLastSeen);
    console.log("LOCAL", localAddress);
  }, [formData.locationLastSeen]);

  // Text inputs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name} = ${value}`);
    let parsedValue: string | number | Date = value;

    if (name === "dateLastSeen") {
      // parse date string into Date
      parsedValue = new Date(value);
    } else if (name === "age" || name === "weight" || name === "height") {
      // convert numeric strings to numbers
      parsedValue = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Select dropdowns (including personStatus)
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // reset when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialFormState });
    }
  }, [initialData]);

  async function onRetrieve(res: AddressAutofillRetrieveResponse) {
    const newAddress = res.features[0].properties.full_address ?? "";
    console.log(newAddress);
    setLocalAddress(newAddress);
    setFormData((prev) => ({
      ...prev,
      locationLastSeen: newAddress,
    }));
  }

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("VALUE", value);
    setLocalAddress(value);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
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
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
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
              value={formData.age}
              onChange={handleInputChange}
              fullWidth
              disabled={readonly}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 1,
              }}
              onKeyDown={(e) => {
                if (["e", "E", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Grid>

          {/* Weight */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="weight"
              label="Weight (lbs)"
              type="number"
              value={formData.weight ?? ""}
              onChange={handleInputChange}
              fullWidth
              disabled={readonly}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 1,
              }}
              onKeyDown={(e) => {
                if (["e", "E", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Grid>

          {/* Height */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="height"
              label="Height (cm)"
              type="number"
              value={formData.height ?? ""}
              onChange={handleInputChange}
              fullWidth
              disabled={readonly}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                min: 1,
              }}
              onKeyDown={(e) => {
                if (["e", "E", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Grid>

          {/* Race */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={readonly}>
              <InputLabel id="race-label">Race</InputLabel>
              <Select
                required
                labelId="race-label"
                name="race"
                value={formData.race}
                label="Race"
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Select a race</em>
                </MenuItem>
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
              value={formData.eyeColor}
              onChange={handleInputChange}
              fullWidth
              disabled={readonly}
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={readonly}>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                required
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                label="Gender"
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Select gender</em>
                </MenuItem>
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
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
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
              value={
                new Date(formData.dateLastSeen).toISOString().split("T")[0]
              }
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={readonly}
              inputProps={{ max: today }}
            />
          </Grid>

          {/* Location Last Seen */}
          <Grid item xs={12} sm={6}>
            <AddressAutofill
              onRetrieve={onRetrieve}
              options={{ streets: false }}
              accessToken={Globals.getMapboxToken()}
            >
              <TextField
                name="locationLastSeen"
                label="Location Last Seen"
                fullWidth
                value={localAddress}
                onChange={handleAddressChange}
                disabled={readonly}
                sx={{
                  "& .MuiOutlinedInput-input": {
                    padding: "25px",
                  },
                }}
              />
            </AddressAutofill>
          </Grid>

          {/* Action Buttons (centered) */}
          <Grid item xs={12} container spacing={2} justifyContent="center">
            {onCancel && (
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFormData(initialFormState);
                    onCancel();
                  }}
                >
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

export default MissingPersonForm;
