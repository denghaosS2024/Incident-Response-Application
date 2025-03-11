import React, { useEffect, useState } from "react";

import { IEmergencyContact } from "@/models/Profile";
import Autocomplete from "@mui/lab/Autocomplete";
import { Button, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import AlertSnackbar from "../components/common/AlertSnackbar";
import { getMapboxToken } from "../components/Map/Mapbox";
import EmergencyContactField from "../components/Profile/EmergencyContactField";
import MedicalInfoField from "../components/Profile/MedicalInfoField";
import ProfileField from "../components/Profile/ProfileField";
import request from "../utils/request";

export default function ProfilePage() {
  const currentUserId = localStorage.getItem('uid');

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const mapboxToken = getMapboxToken();

  const [emergencyContacts, setEmergencyContacts] = useState<IEmergencyContact[]>([]);
  const [medicalInfo, setMedicalInfo] = useState({
    condition: "",
    drugs: "",
    allergies: "",
  });
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSex(event.target.value);
  };

  const handleMedicalInfoChange = (field: string, value: string) => {
    setMedicalInfo((prev) => ({ ...prev, [field]: value }));
  };
  const handleEmergencyContactChange = (newContacts: IEmergencyContact[]) => {
    setEmergencyContacts(newContacts);
  };
  const handleAddressInputChange = async (event: React.SyntheticEvent<Element, Event>, value: string) => {
    if (value.length < 3) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?` +
        `access_token=${mapboxToken}&autocomplete=true&limit=5&country=us&proximity=-98.5795,39.8283`
      );
      const data = await response.json();

      if (data.features) {
        const places = data.features.map((feature: any) => feature.place_name);
        setAddressOptions(places);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(emailRegex.test(value) ? "" : "Invalid email format");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (value.length < 7) {
      setPhoneError("Phone number is too short.");
      return false;
  }
  if (value.length > 15) {
      setPhoneError("Phone number is too long.");
      return false;
  }
  if (!value.startsWith("+")) {
      setPhoneError("Include country code (e.g., +1 for US).");
      return false;
  }
  if (!phoneRegex.test(value)) {
      setPhoneError("Only numbers are allowed (no spaces or symbols).");
      return false;
  }
  
  setPhoneError("");
  return true;
  };

  const isFormValid = () => {
    return (
      emailRegex.test(email) &&
      phoneRegex.test(phone)
      // emergencyContacts.every(contact => 
      //   contact.name.trim() !== "" &&
      //   emailRegex.test(contact.email) &&
      //   phoneRegex.test(contact.phone)
      // )
    );
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    if (!isFormValid()) {
      setSnackbarMessage("Please check the email/phone format.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
      
    const profileData = {
      name,
      dob,
      sex,
      address,
      phone,
      email,
      emergencyContacts,
      medicalInfo,
    };
  
    try {
      await request(`/api/profiles/${currentUserId}`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
      
      setSnackbarMessage("Profile saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSnackbarMessage("Failed to save profile. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUserId) return;
      
      try {
        const profileData = await request<{ 
          name?: string; 
          dob?: string;
          sex?: string;
          address?: string; 
          phone?: string; 
          email?: string; 
          emergencyContacts?: IEmergencyContact[]; 
          medicalInfo?: { condition?: string; drugs?: string; allergies?: string } 
        }>(`/api/profiles/${currentUserId}`);

        console.log("fetchProfileDataing: profileData: ", profileData);
  
        setName(profileData.name || "");
        setDob(profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "");
        setSex(profileData.sex || "");
        setAddress(profileData.address || "");
        setPhone(profileData.phone || "");
        setEmail(profileData.email || "");
        setEmergencyContacts(profileData.emergencyContacts || []);
        setMedicalInfo({
          condition: profileData.medicalInfo?.condition ?? "",
          drugs: profileData.medicalInfo?.drugs ?? "",
          allergies: profileData.medicalInfo?.allergies ?? ""
        });
  
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
  
    fetchProfileData();
  }, [currentUserId]);




  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1> Personal Information</h1>
      <ProfileField label="Name" value={name} onChange={(e) => setName(e.target.value)} />

      <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <Typography variant="body1">Date of Birth:</Typography>
      </Grid>
      <Grid item xs={8} >
        <input 
          type="date" 
          id="birthday" 
          name="birthday" 
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          style={{
            width: "100%", 
            padding: "8px",
            fontSize: "16px",
            backgroundColor: "#f0f0f0", 
            border: "1px solid #ccc",
            borderRadius: "4px", 
            outline: "none", 
          }}
        />
      </Grid>
    </Grid>

    <Grid container spacing={2} alignItems="center" style={{ marginTop: "8px" }}>
      <Grid item xs={2}>
        <Typography variant="body1">Sex:</Typography>
      </Grid>
      <Grid item xs={10}>
        <RadioGroup row value={sex} onChange={handleSexChange} style={{ display: "flex", gap: "4px" }}>
          <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" sx={{ marginRight: "4px" }} />
          <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" sx={{ marginRight: "4px" }} />
          <FormControlLabel value="Other" control={<Radio size="small" />} label="Other" />
        </RadioGroup>
      </Grid>
    </Grid>

    <Autocomplete
        freeSolo
        options={addressOptions}
        onInputChange={handleAddressInputChange}
        onChange={(event, newValue) => setAddress(newValue || "")}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Address"
            variant="outlined"
            fullWidth
            margin="normal"
          />
        )}
      />

      <ProfileField label="Phone" value={phone} onChange={handlePhoneChange} error={!!phoneError} helperText={phoneError} />
      <ProfileField label="Email" value={email} onChange={handleEmailChange} error={!!emailError} helperText={emailError} />

      <MedicalInfoField medicalInfo={medicalInfo} onMedicalInfoChange={handleMedicalInfoChange} />

      <EmergencyContactField 
        contactList={emergencyContacts} 
        setContactList={handleEmergencyContactChange} 
      />

      <Grid container spacing={2} style={{ marginTop: "16px" }}>
        <Grid item xs={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
            Save
          </Button>
        </Grid>
      </Grid>
      <AlertSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={handleSnackbarClose} autoHideDuration={1350}/>
    </div>
  );
}