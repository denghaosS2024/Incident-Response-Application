export interface ISpending {
  _id: string;
  incidentId: string; // ID of the incident
  amount: number; // Amount spent
  date: Date; // Date of the spending
  reason: string; // Name of the resource
}
