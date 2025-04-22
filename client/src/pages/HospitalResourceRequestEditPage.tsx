import ResourceOrRequestForm from "@/components/feature/HospitalResources/ResourceOrRequestForm";
import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import request from "../utils/request";
import HospitalResource from "@/models/HospitalResource";
import { Alert, Snackbar, Typography } from "@mui/material";

const HospitalResourceRequstEditPage: React.FC = () => {
  const { requestId } = useParams<{ requestId?: string }>();
  const [resourceRequest, setResourceRequest] =
    useState<IHospitalResourceRequest>({} as IHospitalResourceRequest);

  const [fetchedRequest, setFetchedRequest] =
    useState<IHospitalResourceRequest>({} as IHospitalResourceRequest);

  const [loading, setLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const [resource, setResource] = useState<HospitalResource>(
    {} as HospitalResource,
  );

  const [errors, setErrors] = useState({
    quantity: false,
  });

  const fetchRequestDetails = async (requestId: string) => {
    try {
      const response = await request(
        `/api/hospital-resources-requests/${requestId}`,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error("Error fetching request details:", error);
      return null;
    }
  };

  const fetchResourceDetails = async (
    resourceName: string,
    hospitalId: string,
  ) => {
    try {
      const response = await request(
        `/api/hospital-resource/allResources/${hospitalId}/${resourceName}`,
        {
          method: "GET",
        },
      );

      return response;
    } catch (error) {
      console.error("Error fetching request details:", error);
      return null;
    }
  };

  useEffect(() => {
    const getResourceRequest = async () => {
      if (requestId) {
        const requestDetails: IHospitalResourceRequest =
          await fetchRequestDetails(requestId);
        if (requestDetails) {
          setFetchedRequest(requestDetails);
          setResourceRequest(requestDetails);
        }
      }
    };
    getResourceRequest();
  }, [requestId]);

  useEffect(() => {
    const getResource = async () => {
      if (fetchedRequest.receiverHospitalId._id) {
        const resourceDetails: HospitalResource = await fetchResourceDetails(
          fetchedRequest.resourceId.resourceName,
          fetchedRequest.receiverHospitalId._id,
        );
        if (resourceDetails) {
          setResource(resourceDetails);
        }
      }
    };
    getResource();
  }, [fetchedRequest]);

  /* Function to show the alert */
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  //* Update an exisiting resource */
  const updateHospitalResourceRequest = async (
    requestId: string,
    requestedQuantity: number,
  ) => {
    console.log("Calling API to update hospital resource.");
    try {
      const response = await request(
        `/api/hospital-resources-requests/${requestId}/requested-quantity`,
        {
          method: "PUT",
          body: JSON.stringify({
            requestedQuantity: requestedQuantity,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      console.log("Hospital resource request updated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error updating a hospital resource request:", error);
      return null;
    }
  };

  /* Function to create or update a new hospital resource on submit*/
  const handleSubmit = async () => {
    if (resourceRequest.requestedQuantity > resource.inStockQuantity) {
      console.log("ddo");
      setErrors({
        ...errors,
        quantity: true,
      });
      return;
    }

    console.log("Submitting hospital resource:", resourceRequest);

    if (requestId) {
      const response = await updateHospitalResourceRequest(
        requestId,
        resourceRequest.requestedQuantity,
      );

      if (response) {
        showSnackbar(
          "Hospital resource request updated successfully!",
          "success",
        );

        setErrors({
          ...errors,
          quantity: false,
        });

        setFetchedRequest(resourceRequest);
      }
    }
  };

  const handleCancel = async () => {
    setResourceRequest(fetchedRequest);
  };

  if (!resourceRequest.resourceId || !resource.inStockQuantity)
    return <div>Loading...</div>;

  return (
    <>
      <ResourceOrRequestForm
        inputFields={[
          {
            label: "Resource name",
            name: "Resource name",
            value: fetchedRequest?.resourceId.resourceName,
            type: "text",
            disabled: true,
            onChange: (e) =>
              setResourceRequest({
                ...fetchedRequest,
                resourceId: {
                  resourceName: String(e.target.value),
                },
              }),
          },
          {
            label: "In-Stock Quantity",
            name: "In-Stock Quantity",
            value: resource.inStockQuantity,
            type: "number",
            disabled: true,
            onChange: (e) => {
              console.log(e.target.value);
            },
          },
          {
            label: "Requested Quantity",
            name: "Requested Quantity",
            value: resourceRequest.requestedQuantity,
            disabled: resourceRequest.status !== "Pending",
            type: "number",
            onChange: (e) => {
              if (Number(e.target.value) <= resource.inStockQuantity) {
                setResourceRequest({
                  ...resourceRequest,
                  requestedQuantity: Number(e.target.value),
                });
              }
            },

            error: errors.quantity,
            helperText: errors.quantity
              ? "Requested Quantity can't exceed in stock quantity"
              : "",
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

export default HospitalResourceRequstEditPage;
