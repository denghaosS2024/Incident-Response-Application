export type SeverityIndex = 0 | 1 | 2 | 3;
export interface IAppointment {
  _id?: string;
  // Per team 1's discussion, we will use Citizen's ID rather than patient's ID
  userId: string;
  // This is nurse's Citizen ID
  nurseId: string | undefined;
  createDate: Date;
  updateDate: Date;
  closedDate: Date | undefined;
  dayOfWeek: number;
  isResolved: boolean;
  issueName: string;
  note: string | undefined;
  severityIndex: SeverityIndex;
  feedback: string | undefined;
  // "Fake" delete, set (valid) boolean to false, we can use this to filter out
  valid: boolean;
  startHour: number;
  endHour: number;
}
