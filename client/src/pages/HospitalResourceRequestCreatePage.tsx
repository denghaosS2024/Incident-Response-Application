import AddRequestForm from "@/components/feature/HospitalResources/AddRequestForm";
import HospitalResource from "@/models/HospitalResource";
import request, { IRequestError } from "@/utils/request";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const HospitalResourceRequestCreatePage: React.FC = () => {
  const { senderHospitalId, hospitalResourceId } = useParams<{
    senderHospitalId: string;
    hospitalResourceId: string;
  }>();

  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] =
    useState<HospitalResource | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const responseData = await request(
          `/api/hospital-resource/id/${hospitalResourceId}`,
        );
        const response = responseData[0];

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

  const handleSubmit = async (data: {
    resourceName: string;
    requestedQuantity: number;
  }) => {
    const requestData = {
      senderHospitalId,
      receiverHospitalId: selectedResource?.hospitalId._id,
      hospitalResourceId,
      resourceName: selectedResource?.resourceId.resourceName,
      requestedQuantity: data.requestedQuantity,
    };

    console.log("Submitted data:", requestData);
    try {
      const response = await request("/api/hospital-resources-requests/", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      console.log("Request submitted successfully:", response);
      return true;
    } catch (error) {
      if ((error as IRequestError).message) {
        console.error(
          "Failed to submit request:",
          (error as IRequestError).message,
        );
        return (error as IRequestError).message;
      } else {
        console.error("Unexpected error:", error);
        return "An unexpected error occurred. Please try again.";
      }
    }
  };

  const handleCancel = () => {
    navigate("/hospital-resource/directory");
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
