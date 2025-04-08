type Priority = "E" | "U" | "H";

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  numNurse: number;
  priority: Priority;
  createdAt: Date;
  groupId: string;
  senderId: string;
  numNurseAccepted: number;
}

export interface GroupAlertState {
  alertQueue: Alert[];
  ongoingAlert?: Alert;
  timeoutHandle?: NodeJS.Timeout;
}
