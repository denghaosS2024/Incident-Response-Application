type Priority = 'E' | 'U' | 'H'

export interface NurseAlert {
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