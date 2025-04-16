import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import IHospitalResource from "@/models/HospitalResource";
import {
    Add,
    NavigateNext as Arrow
} from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import request from "../utils/request";
const HospitalResourcesPage: React.FC = () => {
    const [hospitalResourcesList, setHospitalResourcesList] = useState<IHospitalResource[]>([]);
    const [hospitalName, setHospitalName] = useState<string>("")
    const { hospitalId } = useParams<{ hospitalId?: string }>();
    const navigate = useNavigate()


    useEffect(() => {
        const getHospital = async () => {
        if (hospitalId) {
            const data = await fetchHospitalDetails(hospitalId);
            if (data) {
            setHospitalName(data.hospitalName); 
            }
        }};
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

    // After we figure out the hospitalId format
    // useEffect(() => {
    //     const fetchHospitalResources = async (): Promise<void> => {
    //         try {
    //         const resources = await request(`/api/hospital-resource/allResources/${hospitalId}`)
    //         setHospitalResourcesList(resources)
    //         console.log(resources)
    //         } catch (err) {
    //             const errorMessage =
    //             err instanceof Error ? err.message : "Failed to fetch hospitals";
    //             // setError(errorMessage);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     }
    //     fetchHospitalResources()
    // },[hospitalId])

// Handle redirection to add a new resource
  const redirectToHospitalResource= () => {
    navigate("newResource");
  };

 
  return (
    <Box sx={{ padding: 2 }}>
    <GenericItemizeContainer<IHospitalResource>
      items={hospitalResourcesList}
      key="My Resources"
      getKey={(hospitalResource: IHospitalResource): string => hospitalResource.hospitalId}
      showHeader={false}
      title= {`${hospitalName} Resources`}
      emptyMessage="No resources available"
      columns={[
        {
          key: "resourceName",
          align: "center",
          label: "Resource Name",
          render: (hospitalResource: IHospitalResource): string => hospitalResource.resourceName,
        },
        {
          key: "inStockQuantity",
          align: "center",
          label: "Quanitity",
          render: (hospitalResource:  IHospitalResource): number => hospitalResource.inStockQuantity,
        },
        {
          key: "inStockQuantity",
          align: "center",
          label: "",
          render: (hospital) => (
            <IconButton
              edge="end"
              size="large"
            //   onClick={() => }
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
