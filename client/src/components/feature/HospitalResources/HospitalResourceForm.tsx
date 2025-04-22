import HospitalResource from "@/models/HospitalResource";
import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import request from "../../../utils/request";
import ResourceOrRequestForm from "./ResourceOrRequestForm";
const HospitalResourceForm: React.FC = () => {
  const { resourceId } = useParams<{ resourceId?: string }>();
  const { hospitalId } = useParams<{ hospitalId?: string }>();

  const emptyResourceData = {
    hospitalId: {
      hospitalName: "",
      _id: "",
    },
    resourceId: {
      resourceName: "",
    },
    inStockQuantity: 0,
    inStockAlertThreshold: 0,
  };
  const [hospitalResourceData, setHospitalResourceData] =
    useState<HospitalResource>(emptyResourceData);
  const [fetchedhospitalResourceData, setFetchedhospitalResourceData] =
    useState<HospitalResource>(emptyResourceData);
  const [errors, setErrors] = useState({
    resourceName: false,
    quantity: false,
    inStockAlertThreshold: false
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  // Get the current resource
  useEffect(() => {
    setLoading(true);
    const getHospitalResource = async () => {
      if (resourceId) {
        const data = await fetchHospitalResourceDetails(resourceId);
        if (data) {
          setHospitalResourceData({
            hospitalId: data[0].hospitalId._id,
            resourceId: {
              resourceName: data[0].resourceId.resourceName,
            },
            inStockQuantity: data[0].inStockQuantity,
            inStockAlertThreshold: data[0].inStockAlertThreshold,
          });
          setFetchedhospitalResourceData({
            hospitalId: data[0].hospitalId._id,
            resourceId: {
              resourceName: data[0].resourceId.resourceName,
            },
            inStockQuantity: data[0].inStockQuantity,
            inStockAlertThreshold: data[0].inStockAlertThreshold,
          });
        }
        setLoading(false);
      } else {
        // If creating a new resource, get the mongodb format hospital id (_id) of the current hospital
        const getHospital = async () => {
          if (hospitalId) {
            const data = await fetchHospitalDetails(hospitalId);
            if (data) {
              setHospitalResourceData({
                ...hospitalResourceData,
                hospitalId: {
                  _id: data._id,
                  hospitalName: data.hospitalName,
                },
              });
            }
          }
        };
        setLoading(false);
        getHospital();
      }
    };
    getHospitalResource();
  }, [resourceId]);

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
    console.log(
      "Calling API to fetch hospital resource details based on resourceId",
    );
    try {
      const response = await request(
        `/api/hospital-resource/id/${resourceId}`,
        {
          method: "GET",
        },
      );
      console.log("Fetched hospital resource details:", response);
      return response;
    } catch (error) {
      console.error("Error fetching hospital resource details:", error);
      return null;
    }
  };

  /* Save a new resource */
  const addNewHospitalResource = async (
    hospitalResourceData: HospitalResource,
  ) => {
    console.log("Calling API to add a new hospital resource.");
    try {
      const response = await request("/api/hospital-resource", {
        method: "POST",
        body: JSON.stringify({
          hospitalId: hospitalResourceData.hospitalId._id,
          resourceName: hospitalResourceData.resourceId.resourceName,
          inStockQuantity: hospitalResourceData.inStockQuantity,
          inStockAlertThreshold: hospitalResourceData.inStockAlertThreshold,
        }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Hospital resource added successfully:", response);
      return response;
    } catch (error) {
      console.error("Error adding a hospital resource:", error);
      return null;
    }
  };

  //* Update an exisiting resource */
  const updateHospitalResource = async (
    hospitalResourceData: HospitalResource,
  ) => {
    console.log("Calling API to update hospital resource.");
    try {
      const response = await request("/api/hospital-resource", {
        method: "PUT",
        body: JSON.stringify({
          hospitalId: hospitalResourceData.hospitalId,
          resourceName: hospitalResourceData.resourceId.resourceName,
          inStockQuantity: hospitalResourceData.inStockQuantity,
          inStockAlertThreshold: hospitalResourceData.inStockAlertThreshold,
        }),
        headers: { "Content-Type": "application/json" },
      });
      console.log("Hospital resource updated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error updating a hospital resource:", error);
      return null;
    }
  };

  /* Function to show the alert */
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  /* Function to create or update a new hospital resource on submit*/
  const handleSubmit = async () => {
    if (
      !hospitalResourceData.resourceId.resourceName ||
      !hospitalResourceData.inStockQuantity
    ) {
      setErrors({
        resourceName: !hospitalResourceData.resourceId.resourceName,
        quantity: !hospitalResourceData.inStockQuantity,
        inStockAlertThreshold: false
      }); 
      showSnackbar("The form has errors.", "error"
      );
      return;
    }

    if (errors.inStockAlertThreshold) {
      showSnackbar("The threshold has to be smaller than quantity.", "error"
      );
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

    if (response) {
      showSnackbar(
        resourceId
          ? "Hospital resource updated successfully!"
          : "Hospital resource created successfully!",
        "success",
      );
      setFetchedhospitalResourceData(hospitalResourceData);
    } else {
      showSnackbar(
        resourceId
          ? "Error updating a hospital resource."
          : "Error creating a hospital resource.",
        "error",
      );
    }
  };

  const handleCancel = async () => {
    setHospitalResourceData(fetchedhospitalResourceData);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <ResourceOrRequestForm
        inputFields={[
          {
            label: "Resource name",
            name: "Resource name",
            value: hospitalResourceData.resourceId.resourceName,
            type: "text",
            disabled: resourceId ? true : false,
            onChange: (e) =>
              setHospitalResourceData({
                ...hospitalResourceData,
                resourceId: {
                  resourceName: String(e.target.value),
                },
              }),
            error: errors.resourceName,
            helperText: errors.resourceName ? "Resource name is required" : "",
          },
          {
            label: "Quantity",
            name: "Quantity",
            value: hospitalResourceData.inStockQuantity,
            type: "number",
            onChange: (e) => {
              const inStockQuantity = Number(e.target.value);
              setErrors({
              resourceName: !hospitalResourceData.resourceId.resourceName,
              quantity: !inStockQuantity,
              inStockAlertThreshold: hospitalResourceData?.inStockAlertThreshold ? (hospitalResourceData?.inStockAlertThreshold >= inStockQuantity) : false
              })
              setHospitalResourceData({
                ...hospitalResourceData,
                inStockQuantity
              })},
            error: errors.quantity,
            helperText: errors.quantity ? "Quantity is required" : "",
          },
          {
            label: "Stock Alert Threshold",
            name: "Stock Alert Threshold",
            value: hospitalResourceData.inStockAlertThreshold,
            type: "number",
            onChange: (e) => {
              const inStockAlertThreshold = Number(e.target.value);
              setErrors({
              resourceName: !hospitalResourceData.resourceId.resourceName,
              quantity: !hospitalResourceData.inStockQuantity,
              inStockAlertThreshold: inStockAlertThreshold ? (inStockAlertThreshold >= hospitalResourceData.inStockQuantity) : false
              })
              setHospitalResourceData({
                ...hospitalResourceData,
                inStockAlertThreshold
              })},
            error: errors.inStockAlertThreshold,
            helperText: errors.inStockAlertThreshold ? "The threshold has to be smaller than quantity." : "",
          },
        ]}
        submitButtonText="Submit"
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
      />
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
    </>
  );
};

export default HospitalResourceForm;
