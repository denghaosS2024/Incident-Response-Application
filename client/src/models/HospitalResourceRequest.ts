export interface IHospitalResourceRequest {
  senderHospitalId: string; // Reference to the sender Hospital's _id
  receiverHospitalId: string; // Reference to the receiver Hospital's _id
  hospitalResourceId: string; // Reference to the HospitalResource's _id
  resourceName: string; // Reference to the Resource's _id
  requestedQuantity: number; // Requested quantity of the resource
  status: "Pending" | "Accepted" | "Rejected"; // Status of the request
}
