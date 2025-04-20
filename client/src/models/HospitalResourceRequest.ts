import IHospital from "./Hospital";

export interface IHospitalResourceRequest {
  _id: string;
  senderHospitalId: string; // Reference to the sender Hospital's _id
  receiverHospitalId: IHospital;
  hospitalResourceId: string; // Reference to the HospitalResource's _id
  resourceId: {
    resourceName: string;
  };
  requestedQuantity: number; // Requested quantity of the resource
  status: "Pending" | "Accepted" | "Rejected"; // Status of the request
}
