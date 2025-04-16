export default interface HospitalResource {
  hospitalId: string;
  resourceName: string;
  inStockQuantity: number;
  inStockAlertThreshold?: number;
}