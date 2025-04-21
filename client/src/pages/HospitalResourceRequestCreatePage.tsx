import AddRequestForm from "@/components/feature/HospitalResources/AddRequestForm";
import HospitalResource from "@/models/HospitalResource";
import request from "@/utils/request";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

const HospitalResourceRequestCreatePage: React.FC = () => {
  const { senderHospitalId, hospitalResourceId } = useParams<{
    senderHospitalId: string;
    hospitalResourceId: string;
  }>();

  const [selectedResource, setSelectedResource] =
    useState<HospitalResource | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const responseData = await request(
          `/api/hospital-resource/id/${hospitalResourceId}`,
        );
        const response = responseData[0];
        console.log("Fetched hospital resource:", response);
        const resource: HospitalResource = {
          hospitalId: {
            hospitalName: response.hospitalId.hospitalName,
            _id: response.hospitalId._id,
          },
          resourceId: {
            resourceName: response.resourceId.resourceName,
          },
          _id: response._id,
          inStockQuantity: response.inStockQuantity,
          inStockAlertThreshold: response.inStockAlertThreshold,
        };
        setSelectedResource(resource);
      } catch (error) {
        console.error("Error fetching hospital resource:", error);
      }
    };

    if (hospitalResourceId) {
      fetchResource();
    }
  }, [hospitalResourceId]);

  const handleSubmit = (data: {
    resourceName: string;
    requestedQuantity: number;
  }) => {
    const requestData = {
      senderHospitalId,
      hospitalResourceId,
      ...data,
    };
    console.log("Submitted data:", requestData);
    alert("Request submitted successfully!");
  };

  const handleCancel = () => {
    console.log("Request creation canceled.");
    alert("Request creation canceled.");
  };

  if (!selectedResource) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AddRequestForm
        resourceName={selectedResource.resourceId.resourceName}
        inStock={selectedResource.inStockQuantity}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </div>
  );
};

export default HospitalResourceRequestCreatePage;
