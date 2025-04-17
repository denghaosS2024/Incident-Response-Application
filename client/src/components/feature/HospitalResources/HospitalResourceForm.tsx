import HospitalResource from "@/models/HospitalResource";
import {
  Box,
  Button,
  Paper,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import request from "../../../utils/request";

const HospitalResourceForm: React.FC = () => {
  const { resourceId } = useParams<{ resourceId?: string }>();
  const {hospitalId} = useParams<{hospitalId?: string}>();
  const emptyResourceData = {
    hospitalId: "",
    resourceId: {
      resourceName:"",
    },
    inStockQuantity: 0,
    inStockAlertThreshold: 0,
  };
  const [hospitalResourceData, setHospitalResourceData] = useState<HospitalResource>(emptyResourceData);
  const [errors, setErrors] = useState({
    resourceName: false,
    quantity: false,
  });

  // Get the current resource
  useEffect(() => {
    const getHospitalResource = async () => {
      if (resourceId) {
        const data = await fetchHospitalResourceDetails(resourceId);
        if (data) {
          setHospitalResourceData({
            hospitalId: data[0].hospitalId,
            resourceId: {
              resourceName: data[0].resourceId.resourceName,
            },
            inStockQuantity: data[0].inStockQuantity,
            inStockAlertThreshold: data[0].inStockAlertThreshold,
          });
        }
      } else {
        setHospitalResourceData(emptyResourceData); 
      }
    };

    getHospitalResource();
  }, [resourceId]);

  // Get the mongodb format hospital id (_id)
  useEffect(() => {
      const getHospital = async () => {
      if (hospitalId) {
          const data = await fetchHospitalDetails(hospitalId);
          if (data) {
            setHospitalResourceData({
              ...hospitalResourceData,
              hospitalId: data._id,
            })    
          }
        };
     }
     getHospital();
  }, [hospitalId]);

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

  const fetchHospitalResourceDetails = async (resourceId: string) => {
    console.log("Calling API to fetch hospital resource details based on resourceId");
    try {
    const response = await request(`/api/hospital-resource/id/${resourceId}`, {
        method: "GET",
    });
    console.log("Fetched hospital resource details:", response);
    return response;
    } catch (error) {
    console.error("Error fetching hospital resource details:", error);
    return null;
    }
  };

    /* Save a new resource */
    const addNewHospitalResource = async (hospitalResourceData: HospitalResource) => {
      console.log("Calling API to add a new hospital resource.");
      try {
        const response = await request("/api/hospital-resource", {
          method: "POST",
          body: JSON.stringify({
            hospitalId: hospitalResourceData.hospitalId,
            resourceName: hospitalResourceData.resourceId.resourceName,
            inStockQuantity: hospitalResourceData.inStockQuantity,
            inStockAlertThreshold: hospitalResourceData.inStockAlertThreshold
          }),
          headers: { "Content-Type": "application/json" }
        });
        console.log("Hospital resource added successfully:", response);
        return response;
      } catch (error) {
        console.error("Error adding a hospital resource:", error);
        return null;
      }
    };

    //* Update an exisiting resource */
    const updateHospitalResource = async (hospitalResourceData: HospitalResource )=> {
      console.log("Calling API to update hospital resource.");
      try {
        const response = await request("/api/hospital-resource",{
          method: "PUT",
          body: JSON.stringify({
            hospitalId: hospitalResourceData.hospitalId,
            resourceName: hospitalResourceData.resourceId.resourceName,
            inStockQuantity: hospitalResourceData.inStockQuantity,
            inStockAlertThreshold: hospitalResourceData.inStockAlertThreshold
          }),
          headers: { "Content-Type": "application/json" }
        })
        console.log("Hospital resource updated successfully:", response);
        return response;
      } catch (error) {
        console.error("Error updating a hospital resource:", error);
        return null;
      }
    }

     /* Function to create or update a new hospital resource on submit*/
    const handleSubmit = async () => {
      if (!hospitalResourceData.resourceId.resourceName || !hospitalResourceData.inStockQuantity) {
        setErrors({
          resourceName: !hospitalResourceData.resourceId.resourceName,
          quantity: !hospitalResourceData.inStockQuantity,
        });
        return;
      }

      console.log("Submitting hospital resource:", hospitalResourceData);
      let response;
      // Check if resource exists: update if true, else create a new one
      if (resourceId) {
        response = await updateHospitalResource(hospitalResourceData);
      } else {
        response = await addNewHospitalResource(hospitalResourceData);
      }
    };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      {/* Resource name*/}
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        disabled={resourceId ? true : false}
        value={hospitalResourceData.resourceId.resourceName}
        onChange={(e) =>
          setHospitalResourceData({
            ...hospitalResourceData,
            resourceId: {
              resourceName: String(e.target.value)
          }}
          )
        }
      />
      {/* Quantity */}
      <TextField
        label="Quantity"
        fullWidth
        type="number"
        margin="normal"
        value={hospitalResourceData.inStockQuantity}
        onChange={(e) =>
          setHospitalResourceData({
            ...hospitalResourceData,
            inStockQuantity: Number(e.target.value),
          })
        }
        InputProps={{
          inputProps: {
            inputMode: "numeric", // Forces numeric keyboard on iOS
            pattern: "[0-9]*", // Ensures only numbers are entered
            max: 110,
            min: 1,
          },
        }}
      />
       {/* Stock Alert Threshold */}
       <TextField
        label="Stock Alert Threshold"
        fullWidth
        type="number"
        margin="normal"
        value={hospitalResourceData.inStockAlertThreshold}
        onChange={(e) =>
          setHospitalResourceData({
            ...hospitalResourceData,
            inStockAlertThreshold: Number(e.target.value),
          })
        }
        InputProps={{
          inputProps: {
            inputMode: "numeric", // Forces numeric keyboard on iOS
            pattern: "[0-9]*", // Ensures only numbers are entered
            max: 110,
            min: 1,
          },
        }}
      />
      {/* Buttons to submit, cancel or delete */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default HospitalResourceForm;
