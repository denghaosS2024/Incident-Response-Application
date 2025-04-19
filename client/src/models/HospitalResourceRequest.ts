export interface IHospitalResourceRequest {
  senderHospitalId: string; // Reference to the sender Hospital's _id
  receiverHospitalId: string; // Reference to the receiver Hospital's _id
  hospitalResourceId: string; // Reference to the HospitalResource's _id
  resourceId: {
    resourceName: string;
  };
  requestedQuantity: number; // Requested quantity of the resource
  status: "Pending" | "Accepted" | "Rejected"; // Status of the request
}
