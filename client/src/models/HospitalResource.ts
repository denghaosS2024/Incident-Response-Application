export default interface HospitalResource {
  hospitalId: {
    hospitalName: string;
    _id: string;
  };
  resourceId: {
    resourceName: string;
  };
  _id?: string;
  inStockQuantity: number;
  inStockAlertThreshold?: number;
}
