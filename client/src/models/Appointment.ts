export interface IAppointment {
  _id: string;
  // Per team 1's discussion, we will use Citizen's ID rather than patient's ID
  userId: string;
  // This is nurse's Citizen ID
  nurseId: string;
  createDate: Date;
  updateDate: Date;
  closedDate: Date;
  isResolved: boolean;
  issueName: string;
  note: string;
  severityIndex: number;
}
