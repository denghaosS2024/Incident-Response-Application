import IHospital from "@/models/Hospital";
import { setHospital } from "@/redux/hospitalSlice";
import { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { AddressAutofill } from "@mapbox/search-js-react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import Globals from "../utils/Globals";
import request from "../utils/request";

const RegisterHospital: React.FC = () => {
  /* ------------------------------ CONSTANTS ------------------------------ */

  const emptyHospitalData: IHospital = {
    hospitalId: "",
    hospitalName: "",
    hospitalAddress: "",
    hospitalDescription: "",
    totalNumberERBeds: 0,
    totalNumberOfPatients: 0,
    patients: [],
    nurses: [],
  };

  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const [hospitalData, setHospitalData] =
    useState<IHospital>(emptyHospitalData);

  const [errors, setErrors] = useState({
    hospitalName: false,
    hospitalAddress: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("uid");
  const username = localStorage.getItem("username");
  const hospitalFromSlice: IHospital = useSelector(
    (state: any) => state.hospital.hospitalData,
  );

  const [nurseAlreadyRegistered, setNurseAlreadyRegistered] = useState(false);

  // Local state for the address input field
  const [inputAddress, setInputAddress] = useState(
    hospitalData.hospitalAddress ?? "",
  );


  /* ------------------------------ USE EFFECTS ------------------------------ */

  useEffect(() => {
    const getHospital = async () => {
      if (hospitalId) {
        const data = await fetchHospitalDetails(hospitalId);
        if (data) {
          setHospitalData(data); // local state
          dispatch(setHospital(data)); // redux state
        }
      } else {
        setHospitalData(emptyHospitalData); // local state
        dispatch(setHospital(emptyHospitalData)); // redux state
      }
    };

    getHospital();
  }, [hospitalId]);

  // On Page load, check if a nurse is already registered at a hospital
  useEffect(() => {
    const checkNurseRegistration = async () => {
      if (!userId) return;
      try {
        const allHospitals: IHospital[] = await request("/api/hospital", {
          method: "GET",
        });
        if (allHospitals && Array.isArray(allHospitals)) {
          const found = allHospitals.some(
            (hospital) => hospital.nurses && hospital.nurses.includes(userId),
          );
          setNurseAlreadyRegistered(found);
        }
      } catch (error) {
        console.error("Error fetching all hospitals:", error);
      }
    };
    checkNurseRegistration();
  }, [userId]);

  /* ------------------------------ ADDRESS AUTOFILL ------------------------------ */

  // If a user clicks on a suggestion from the autofil dropdown, we update the the new location!
  async function onRetrieve(res: AddressAutofillRetrieveResponse) {
    const newAddress = res.features[0].properties.full_address ?? "";
    setHospitalData({ ...hospitalData, hospitalAddress: newAddress });
  }

  // When user clicks out of the input, we revert it back to the original location
  function onBlur() {
    setInputAddress(hospitalData.hospitalAddress ?? "");
  }

  useEffect(() => {
    setInputAddress(hospitalData.hospitalAddress);
  }, [hospitalData.hospitalAddress]);

  /* ------------------------------ API CALLS ------------------------------ */

  /* API call to register a new hospital */
  const registerHospital = async (hospitalData: IHospital) => {
    console.log("Calling API to register a new hospital.");
    try {
      const response = await request("/api/hospital/register", {
        method: "POST",
        body: JSON.stringify(hospitalData),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Hospital registered successfully:", response);
      return response;
    } catch (error) {
      console.error("Error registering hospital:", error);
      return null;
    }
  };

  /* API call to fetch details of a hospital based on hospital Id */
  const fetchHospitalDetails = async (hospitalId: string) => {
    console.log("Calling API to fetch hospital details based on hospitalId");
    try {
      const response = await request(`/api/hospital?hospitalId=${hospitalId}`, {
        method: "GET",
      });
      console.log("Fetched hospital details:", response);
      return response;
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      return null;
    }
  };

  // API call to update an existing hospital
  const updateHospital = async (hospitalData: IHospital) => {
    console.log("Calling API to update hospital.");
    try {
      const response = await request("/api/hospital", {
        method: "PUT",
        body: JSON.stringify(hospitalData),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Hospital updated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error updating hospital:", error);
      return null;
    }
  };

  const registerNurseToHospital = async (
    userId: string,
    hospitalId: string,
  ) => {
    try {
      const response = await request(`/api/users/${userId}/hospital`, {
        method: "PUT",
        body: JSON.stringify({ hospitalId }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Nurse registered to hospital successfully:", response);
      return response;
    } catch (error) {
      console.error("Error registering nurse to hospital:", error);
      return null;
    }
  };

  /* ------------------------------ FUNCTIONS ------------------------------ */

  /* Function to create or update the hospital discussion (SEM-2563) */
  const updateHospitalDiscussion = async (hospitalData: IHospital) => {
    try {
      const currentUserId = localStorage.getItem("uid");
      if (!currentUserId) {
        console.error("User not logged in");
        return;
      }

      // Check if the hospital already has a group
      const hospital: IHospital | null = await fetchHospitalDetails(
        hospitalData.hospitalId,
      );
      if (!hospital) return;

      const hospitalGroup = hospital.hospitalGroupId;

      if (hospitalGroup != null) {
        const channel = await request(`/api/channels/${hospitalGroup}`, {
          method: "GET",
        });

        // if the current user is not registerd
        if (!channel.users.includes(currentUserId)) {
          // If the hospital already has a discussion group, we only need make sure that new nurses are added to it
          await request(`/api/channels`, {
            method: "PUT",
            body: JSON.stringify({
              _id: hospitalGroup,
              users: [...hospitalData.nurses],
            }),
          });
        }
      } else {
        // Create a new discussion group, where channelId=hospitalData._id (reason: the format of hospitalId does not match the format of channelId)
        const newHospitalGroup = await request("/api/channels", {
          method: "POST",
          body: JSON.stringify({
            _id: hospitalData._id,
            owner: currentUserId,
            name: hospitalData.hospitalName,
            users: [...hospitalData.nurses],
          }),
        });

        // Update the hospital with the new hospitalGroupId
        await request("/api/hospital", {
          method: "PUT",
          body: JSON.stringify({
            hospitalId: hospitalData.hospitalId,
            hospitalGroupId: newHospitalGroup._id,
            nurses: [...hospitalData.nurses],
          }),
        });
      }

      // // Navigate back to the hospital directory -- confirmed with Cecile
      navigate("/hospitals");
    } catch (error) {
      console.error("Error in updateHospitalDiscussion:", error);
    }
  };

  /* Function to show the alert */
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  /* Function to register or update a new hospital on submit*/
  const handleSubmit = async () => {
    if (!hospitalData.hospitalName || !hospitalData.hospitalAddress) {
      setErrors({
        hospitalName: !hospitalData.hospitalName,
        hospitalAddress: !hospitalData.hospitalAddress,
      });
      return;
    }

    // Ensure total ER beds are not less than the number of patients.
    if (hospitalData.totalNumberERBeds < hospitalData.totalNumberOfPatients) {
      showSnackbar(
        `Total ER Beds (${hospitalData.totalNumberERBeds}) cannot be less than total number of patients (${hospitalData.totalNumberOfPatients}).`,
        "error",
      );
      return;
    }

    console.log("Submitting hospital:", hospitalData);
    let response;

    // Check if hospitalId exists: update if true, else register new hospital
    if (hospitalId) {
      response = await updateHospital(hospitalData);
      // If the user is a nurse and has checked the checkbox, register the nurse to the hospital
      if (role === "Nurse" && userId && hospitalData.nurses.includes(userId)) {
        const nurseResponse = await registerNurseToHospital(
          userId,
          response.hospitalId,
        );
        if (nurseResponse) {
          console.log("Nurse successfully registered to hospital");
        } else {
          console.error("Failed to register nurse to hospital");
        }
      }
    } else {
      response = await registerHospital(hospitalData);
      if (role === "Nurse" && userId && hospitalData.nurses.includes(userId)) {
        const nurseResponse = await registerNurseToHospital(
          userId,
          response.hospitalId,
        );
        if (nurseResponse) {
          console.log("Nurse successfully registered to hospital");
        } else {
          console.error("Failed to register nurse to hospital");
        }
      }
    }

    if (response) {
      showSnackbar(
        hospitalId
          ? "Hospital updated successfully!"
          : "Hospital created successfully!",
        "success",
      );

      console.log("The response after creating an incident is :" + response);
      dispatch(setHospital(response)); // update hospital slice on submit

      setTimeout(() => {
        updateHospitalDiscussion(response);
      }, 2000);
    } else {
      showSnackbar(
        hospitalId ? "Error updating hospital." : "Error registering hospital.",
        "error",
      );
    }
  };

  /* Handle cancellation of hospital registration (SEM-2564) */
  const handleCancel = () => {
    setHospitalData({ ...hospitalFromSlice });
  };

  const navigateToResources = () => {
    navigate('resources');
  }

  const navigateToRequests = () => {
    navigate("requests");
  };

  /* Handle deletion of existing hospital (SEM-2565) */
  const handleDelete = async () => {
    // Check if there are existing patients
    if (
      (hospitalData.patients && hospitalData.patients.length > 0) ||
      (hospitalData.totalNumberOfPatients &&
        hospitalData.totalNumberOfPatients > 0)
    ) {
      // Show a popup message (using window.alert) and do nothing else
      window.alert(
        "There are existing patients in the Hospital. You cannot delete it while patients are present.",
      );
      return;
    }

    // Ask for confirmation before deletion
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the Hospital?",
    );

    if (confirmDelete) {
      try {
        const response = await request(
          `/api/hospital?hospitalId=${hospitalData.hospitalId}`,
          {
            method: "DELETE",
          },
        );

        console.log("Hospital deleted successfully:", response);
        showSnackbar("Hospital deleted successfully!", "success");

        // Wait 2 seconds before navigating away
        setTimeout(() => {
          navigate("/hospitals");
        }, 2000);
      } catch (error) {
        console.error("Error deleting hospital:", error);
        showSnackbar("Error deleting hospital.", "error");
      }
    } else {
      // User cancelled the deletion, do nothing.
      console.log("Deletion cancelled by user.");
    }
  };

  /* ------------------------------ RENDER PAGE ------------------------------ */
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
        {/* Hospital Name */}
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={hospitalData.hospitalName}
          onChange={(e) => {
            setHospitalData({
              ...hospitalData,
              hospitalName: e.target.value,
            });
          }}
          error={errors.hospitalName}
          helperText={errors.hospitalName ? "Hospital name is required" : ""}
          sx={{
            "& .MuiOutlinedInput-input": {
              padding: "25px",
            },
          }}
        />

        {/* Hospital Address */}
        <form>
          <AddressAutofill
            onRetrieve={onRetrieve}
            options={{ streets: false }}
            accessToken={Globals.getMapboxToken()}
          >
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={inputAddress}
              onChange={(e) => {
                setInputAddress(e.target.value);
              }}
              onBlur={onBlur}
              error={errors.hospitalAddress}
              helperText={errors.hospitalAddress ? "Address is required" : ""}
              sx={{
                "& .MuiOutlinedInput-input": {
                  padding: "25px",
                },
              }}
            />
          </AddressAutofill>
        </form>

        {/* Hospital Description */}
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={hospitalData.hospitalDescription}
          onChange={(e) =>
            setHospitalData({
              ...hospitalData,
              hospitalDescription: e.target.value,
            })
          }
        />

        {/* Total ER Beds */}
        <TextField
          label="Total number ER beds"
          fullWidth
          type="number"
          margin="normal"
          value={hospitalData.totalNumberERBeds}
          onChange={(e) =>
            setHospitalData({
              ...hospitalData,
              totalNumberERBeds: Number(e.target.value),
            })
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">🛏️</InputAdornment>
            ),
            inputProps: {
              inputMode: "numeric", // Forces numeric keyboard on iOS
              pattern: "[0-9]*", // Ensures only numbers are entered
              max: 110,
              min: 1,
            },
          }}
        />

        {/* Total Nurses */}
        <Typography variant="body1" sx={{ mt: 2 }}>
          Nurses:{" "}
          {hospitalData.nurses && hospitalData.nurses.length > 0
            ? hospitalData.nurses.map((nurse: any) => nurse.username).join(", ")
            : "None Listed"}
        </Typography>

        {/* Show checkbox only if role is 'Nurse' and the nurse is not registered in any hospital */}
        {role === "Nurse" &&
          (nurseAlreadyRegistered ? (
            <Typography variant="body2" color="textSecondary">
              You are already registered in a hospital.
            </Typography>
          ) : (
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    userId ? hospitalData.nurses.includes(userId) : false
                  }
                  onChange={(e) => {
                    if (e.target.checked && userId) {
                      // Add nurse only if not already present
                      if (!hospitalData.nurses.includes(userId)) {
                        setHospitalData((prev) => ({
                          ...prev,
                          nurses: [...prev.nurses, userId],
                        }));
                      }
                    } else if (!e.target.checked && userId) {
                      // Remove the nurse on uncheck
                      setHospitalData((prev) => ({
                        ...prev,
                        nurses: prev.nurses.filter(
                          (nurseId) => nurseId !== userId,
                        ),
                      }));
                    }
                  }}
                  color="primary"
                />
              }
              label="I work at this hospital's ER"
            />
          ))}

        {/* Buttons to submit, cancel or delete */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="contained" color="primary" onClick={handleCancel}>
            Cancel
          </Button>
          {hospitalId && (
            <Button variant="contained" color="primary" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </Box>

        {/* For Alerts pertaining to hospital registration or updation*/}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>

      {role === "Nurse" && nurseAlreadyRegistered && (
        <Box className="grid w-96 flex-column m-2 justify-center hey">
          <Button
            className="m-2"
            variant="contained"
            color="primary"
            onClick={navigateToRequests}
          >
            Manage Requests
          </Button>

          <Button
            className="m-2"
            variant="contained"
            color="primary"
            onClick={navigateToResources}
          >
            Manage Resources
          </Button>
        </Box>
      )}
    </>
  );
};

export default RegisterHospital;
