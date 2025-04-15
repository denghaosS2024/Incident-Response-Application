export interface HospitalResourceRequest {
  hospitalId: string;
  resourceName: string;
  inStockQuantity: number;
  inStockAlertThreshold?: number;
}