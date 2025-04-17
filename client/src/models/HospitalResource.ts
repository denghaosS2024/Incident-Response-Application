export default interface HospitalResource {
  hospitalId: string;
  resourceId:{
    resourceName: string;
  }
  _id?: string,
  inStockQuantity: number;
  inStockAlertThreshold?: number;
}