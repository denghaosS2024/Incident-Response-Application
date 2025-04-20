import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import IHospital from "@/models/Hospital";
import HospitalResource from "@/models/HospitalResource";
import { Add, NavigateNext as Arrow } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";
const HospitalResourcesPage: React.FC = () => {
  const [hospitalResourcesList, setHospitalResourcesList] = useState<
    HospitalResource[]
  >([]);
  const [hospitalName, setHospitalName] = useState<string>("");
  const [hospitalData, setHospitalData] = useState<IHospital>();
  const { hospitalId } = useParams<{ hospitalId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const getHospital = async () => {
      if (hospitalId) {
        const data = await fetchHospitalDetails(hospitalId);
        console.log("hospital", data);
        if (data) {
          setHospitalName(data.hospitalName);
          setHospitalData(data);
          const resources = await fetchHospitalResources(data._id);
          if (resources) {
            setHospitalResourcesList(resources);
          }
        }
      }
    };
    getHospital();
  }, [hospitalId]);

  // should update to use redux slice later

  // this part is uselessnow, when you fetch hospital resources, the hospital details alre also populated
  const fetchHospitalDetails = async (hospitalId: string) => {
    console.log("Calling API to fetch hospital details based on hospitalId");
    try {
      // should be clear that it's hospitalId or hospital _id
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

  const fetchHospitalResources = async (hospitalId: string) => {
    try {
      const resources = await request(
        `/api/hospital-resource/allResources/${hospitalId}`,
        {
          method: "GET",
        },
      );
      console.log(hospitalData?._id);
      setHospitalResourcesList(resources);
      console.log("resources", resources);
      return resources;
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      return null;
    }
  };

  // Handle redirection to add a new resource
  const redirectToHospitalResource = () => {
    navigate("newResource");
  };

  // Handle redirection to see details of an exisiting resource
  const redirectToHospitalResourceDetails = (
    hospitalResource: HospitalResource,
  ) => {
    navigate(`newResource/${hospitalResource._id}`);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <GenericItemizeContainer
        items={hospitalResourcesList}
        key="My Resources"
        getKey={(hospitalResource: HospitalResource): string =>
          hospitalResource.hospitalId._id
        }
        showHeader={false}
        title={`${hospitalName} Resources`}
        emptyMessage="No resources available"
        columns={[
          {
            key: "resourceId",
            align: "center",
            label: "Resource Name",
            render: (hospitalResource: HospitalResource): string =>
              hospitalResource.resourceId.resourceName,
          },
          {
            key: "inStockQuantity",
            align: "center",
            label: "Quanitity",
            render: (hospitalResource: HospitalResource): string =>
              `Quantity: ${hospitalResource.inStockQuantity}`,
          },
          {
            key: "_id",
            align: "center",
            label: "",
            render: (hospitalResource) => (
              <IconButton
                edge="end"
                size="large"
                onClick={() =>
                  redirectToHospitalResourceDetails(hospitalResource)
                }
              >
                <Arrow />
              </IconButton>
            ),
          },
        ]}
      />
      <IconButton
        sx={{
          position: "fixed",
          bottom: 30,
          right: 10,
          width: 56,
          height: 56,
        }}
        onClick={redirectToHospitalResource}
      >
        <Add fontSize="large" />
      </IconButton>
    </Box>
  );
};

export default HospitalResourcesPage;
