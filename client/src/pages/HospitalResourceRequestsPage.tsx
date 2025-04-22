import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import IHospital from "@/models/Hospital";
import HospitalResource from "@/models/HospitalResource";
import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";
import {
  fetchIncomingHospitalResourceRequests,
  fetchOutgoingHospitalResourceRequests,
} from "@/redux/hospitalResourceRequestSlice";
import { fetchHospitalResourcesForSpecificHospital } from "@/redux/hospitalResourceSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { NavigateNext as Arrow } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";

const HospitalResourceRequestsPage: React.FC = () => {
  const incomingRequests: IHospitalResourceRequest[] = useSelector(
    (state: RootState) => state.hositalResourceRequestState.incomingRequests,
  );
  const outgoingRequests: IHospitalResourceRequest[] = useSelector(
    (state: RootState) => state.hositalResourceRequestState.outgoingRequests,
  );

  const resources: HospitalResource[] = useSelector(
    (state: RootState) => state.hospitalResourceState.resources,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const [hospitalData, setHospitalData] = useState<IHospital>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  const fetchHospitalDetails = async (hospitalId: string) => {
    console.log("Calling API to fetch hospital details based on hospitalId");
    try {
      const response: IHospital = await request(
        `/api/hospital?hospitalId=${hospitalId}`,
        {
          method: "GET",
        },
      );
      console.log("Fetched hospital details:", response);
      return response;
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      return null;
    }
  };

  const handleAcceptIncomingRequest = async (requestId: string) => {
    try {
      const response = await request(
        `/api/hospital-resources-requests/${requestId}/status/accepted`,
        {
          method: "PUT",
        },
      );
      console.log("Acceptance PUT result", response);
      setSnackbarMessage("Request Accepted Successfully!");
      setSnackbarSeverity("success");
      setIsDialogOpen(false);
      dispatch(fetchIncomingHospitalResourceRequests(hospitalData?._id!));
      return;
    } catch (error) {
      console.error("Error updating to Accepted status:", error);
      setSnackbarMessage("Error Accepting Incoming Request");
      setSnackbarSeverity("error");
      setIsDialogOpen(false);
      return;
    }
  };

  const handleRejectIncomingRequest = async (requestId: string) => {
    try {
      const response = await request(
        `/api/hospital-resources-requests/${requestId}/status/rejected`,
        {
          method: "PUT",
        },
      );
      console.log("Acceptance PUT result", response);
      setSnackbarMessage("Request Rejected Successfully!");
      setSnackbarSeverity("success");
      dispatch(fetchIncomingHospitalResourceRequests(hospitalData?._id!));
      setIsDialogOpen(false);
      return;
    } catch (error) {
      console.error("Error updating to Rejected status:", error);
      setSnackbarMessage("Error Rejecting Incoming Request");
      setSnackbarSeverity("error");
      setIsDialogOpen(false);
      return;
    }
  };

  useEffect(() => {
    const getHospital = async () => {
      if (hospitalId) {
        const data = await fetchHospitalDetails(hospitalId);
        if (data) {
          setHospitalData(data);
        }
      }
    };
    getHospital();
  }, [hospitalId]);

  useEffect(() => {
    if (hospitalData?._id) {
      dispatch(fetchIncomingHospitalResourceRequests(hospitalData?._id));
      dispatch(fetchOutgoingHospitalResourceRequests(hospitalData?._id));
      dispatch(fetchHospitalResourcesForSpecificHospital(hospitalData?._id));
    }
  }, [hospitalData]);

  const searchForResource = (resourceNmae: string) => {
    const result = resources.find(
      (resource) => resource.resourceId.resourceName === resourceNmae,
    );

    const inStock = result?.inStockQuantity;
    return inStock;
  };

  // Handle redirection to see details of an exisiting resource
  const redirectToIncomingHospitalResourceDetails = (requestId: string) => {
    navigate(`/hospital-resource-request/${hospitalId}/${requestId}`);
  };

  return (
    <Box className="p-2">
      <GenericItemizeContainer
        items={incomingRequests}
        key="Incoming Requests"
        getKey={(hospitalResourceRequest: IHospitalResourceRequest): string =>
          hospitalResourceRequest._id
        }
        showHeader={false}
        title={`Incoming Requests`}
        emptyMessage="No resources available"
        columns={[
          {
            key: "resourceId",
            align: "center",
            label: "Resource Name",
            width: 90,
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string => hospitalResourceRequest.resourceId.resourceName,
          },
          {
            key: "requestedQuantity",
            align: "center",
            label: "Quanitity",
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string =>
              `Requested Quantity: ${hospitalResourceRequest.requestedQuantity}`,
          },
          {
            key: "receiverHospitalId",
            align: "center",
            label: "Resource Name",
            width: 70,
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string => {
              return `Instock: ${searchForResource(hospitalResourceRequest.resourceId.resourceName)}`;
            },
          },
          {
            key: "status",
            align: "center",
            label: "",

            render: (__hospitalResourceRequest: IHospitalResourceRequest) => (
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  padding: "2px 8px",
                  minWidth: "60px",
                  fontSize: "0.7rem",
                }}
                onClick={() => {
                  setSelectedRequestId(__hospitalResourceRequest._id);
                  setIsDialogOpen(true);
                }}
              >
                Respond
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Respond to Request</DialogTitle>
        <DialogContent>
          {"Do you want to Accept or Reject this request?"}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="secondary">
            CANCEL
          </Button>
          <Button
            onClick={() => handleAcceptIncomingRequest(selectedRequestId!)}
            color="primary"
          >
            ACCEPT
          </Button>
          <Button
            onClick={() => handleRejectIncomingRequest(selectedRequestId!)}
            color="primary"
          >
            REJECT
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Modal open={true}>
        <Box
          onClick={()=>console.log("pop")}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            hey
          </Typography>
        </Box>
      </Modal> */}

      <GenericItemizeContainer
        items={outgoingRequests}
        key="Outgoing Requests"
        getKey={(hospitalResourceRequest: IHospitalResourceRequest): string =>
          hospitalResourceRequest._id
        }
        showHeader={false}
        title={`Outgoing Requests`}
        emptyMessage="No resources available"
        columns={[
          {
            key: "resourceId",
            align: "center",
            label: "Resource Name",
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string => hospitalResourceRequest.resourceId.resourceName,
          },
          {
            key: "requestedQuantity",
            align: "center",
            label: "Quanitity",
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string =>
              `Requested Quantity: ${hospitalResourceRequest.requestedQuantity}`,
          },
          {
            key: "status",
            align: "center",
            label: "Status",
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string => `Status: ${hospitalResourceRequest.status}`,
          },
          {
            key: "hospitalResourceId",
            align: "center",
            label: "",
            render: (hospitalResourceRequest) => (
              <IconButton
                edge="end"
                size="large"
                onClick={() =>
                  redirectToIncomingHospitalResourceDetails(
                    hospitalResourceRequest._id,
                  )
                }
              >
                <Arrow />
              </IconButton>
            ),
          },
        ]}
      />
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HospitalResourceRequestsPage;
