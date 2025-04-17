export default interface HospitalResource {
  hospitalId: string;
  resourceName: string;
  resourceId: {
  _id: string,
  resourceName: string,
  },
  inStockQuantity: number;
  inStockAlertThreshold?: number;
}