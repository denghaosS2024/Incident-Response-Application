type Priority = 'E' | 'U' | 'H'

export interface Alert {
    id: string;
    patientId: string;
    patientName: string;
    numNurse: number;
    priority: Priority;
    createdAt: Date;
    groupId: string;
    status: 'waiting' | 'ongoing' | 'sent';
  }
  
export interface GroupAlertState {
ongoingAlert?: Alert;
alertQueue: Alert[];
timeoutHandle?: NodeJS.Timeout;
}
