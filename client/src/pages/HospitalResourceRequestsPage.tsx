import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import IHospital from "@/models/Hospital";
import HospitalResource from "@/models/HospitalResource";
import { Add, NavigateNext as Arrow } from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  Select,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";
import {
  fetchIncomingHospitalResourceRequests,
  fetchOutgoingHospitalResourceRequests,
} from "@/redux/hospitalResourceRequestSlice";
import { fetchHospitalResourcesForSpecificHospital } from "@/redux/hospitalResourceSlice";

const HospitalResourceRequestsPage: React.FC = () => {
  const incomingRequests: IHospitalResourceRequest[] = useSelector(
    (state: RootState) => state.hositalResourceRequestState.incomingRequests,
  );
  const outgoingRequests: IHospitalResourceRequest[] = useSelector(
    (state: RootState) => state.hositalResourceRequestState.incomingRequests,
  );

  const resources: HospitalResource[] = useSelector(
    (state: RootState) => state.hospitalResourceState.resources,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const [hospitalData, setHospitalData] = useState<IHospital>();

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
  const redirectToIncomingHospitalResourceDetails = (resourceNmae: string) => {
    const result = resources.find(
      (resource) => resource.resourceId.resourceName === resourceNmae,
    );

    const resourceId = result?._id;

    navigate(
      `/register-hospital/${hospitalId}/resources/newResource/${resourceId}`,
      {
        state: {
          hospitalResource: result,
        },
      },
    );
  };

  // const fetchInstockQuantity = async (resourceId: string) => {
  //   try {
  //     const response: HospitalResource = await request(
  //       `/api/hospital-resource/${hospitalId}/${resourceId}`,
  //       {
  //         method: "GET",
  //       },
  //     );
  //     if (response) {
  //       return response.inStockQuantity;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching hospital details:", error);
  //     return null;
  //   }
  // };

  return (
    <Box className="p-2">
      <GenericItemizeContainer
        items={incomingRequests}
        key="Incoming Requests"
        getKey={(hospitalResourceRequest: IHospitalResourceRequest): string =>
          hospitalResourceRequest.senderHospitalId
        }
        showHeader={false}
        title={`Incoming Requests`}
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
            key: "resourceId",
            align: "center",
            label: "Resource Name",
            render: (
              hospitalResourceRequest: IHospitalResourceRequest,
            ): string => {
              return `Instock: ${searchForResource(hospitalResourceRequest.resourceId.resourceName)}`;
            },
          },
          // {
          //   key: "hospitalResourceId",
          //   align: "center",
          //   label: "",
          //   render: (hospitalResourceRequest: IHospitalResourceRequest) => (
          //     <FormControl fullWidth sx={{ mb: 2 }}>
          //       <InputLabel id="patient-select-label">Patient</InputLabel>
          //       <Select
          //         labelId="request-select-label"
          //         value={selectedPatientId}
          //         label="Patient"
          //         onChange={(e) => setSelectedPatientId(e.target.value)}
          //       >
          //         <MenuItem key={} value={patient.id}>
          //           {patient.username}
          //         </MenuItem>
          //       </Select>
          //     </FormControl>
          //   ),
          // },
        ]}
      />

      <GenericItemizeContainer
        items={outgoingRequests}
        key="Outgoing Requests"
        getKey={(hospitalResourceRequest: IHospitalResourceRequest): string =>
          hospitalResourceRequest.receiverHospitalId
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
            key: "hospitalResourceId",
            align: "center",
            label: "",
            render: (hospitalResource) => (
              <IconButton
                edge="end"
                size="large"
                onClick={() =>
                  redirectToIncomingHospitalResourceDetails(
                    hospitalResource.resourceId.resourceName,
                  )
                }
              >
                <Arrow />
              </IconButton>
            ),
          },
        ]}
      />
    </Box>
  );
};

export default HospitalResourceRequestsPage;
