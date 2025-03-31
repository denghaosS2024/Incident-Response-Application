import { Alert, GroupAlertState } from "../models/AlertQueue";
class AlertService {
    private static instance: AlertService;
    private groupAlertMap: Map<string, GroupAlertState> = new Map();

    private constructor() {}

    public static getInstance(): AlertService {
        if (!AlertService.instance) {
            AlertService.instance = new AlertService();
        }
        return AlertService.instance;
    }

    public getGroupAlertState(groupId: string): GroupAlertState | undefined {
        return this.groupAlertMap.get(groupId);
    }

    public setGroupAlertState(groupId: string, groupAlertState: GroupAlertState): void {
        this.groupAlertMap.set(groupId, groupAlertState);
    }

    public queueAlert(alert: Alert): void {
        const groupId = alert.groupId;
        const groupAlertState = this.getGroupAlertState(groupId);
        if (groupAlertState) {
            groupAlertState.alertQueue.push(alert);
        } else {
            this.setGroupAlertState(groupId, {
                alertQueue: [alert],
                ongoingAlert: undefined,
                timeoutHandle: undefined,
            });
        }
        console.log('alertState', groupId, this.groupAlertMap)
    }

    public sendAlert(groupId: string): void {
        const groupAlertState = this.getGroupAlertState(groupId);
        if (groupAlertState) {
            groupAlertState.ongoingAlert = groupAlertState.alertQueue.shift();
        }
        console.log('alertState', groupId, this.groupAlertMap)

    }

    // private static comparePriority(a: string, b: string): number {
    //     const priorityRank: Record<string, number> = {
    //       'E': 3, 'U': 2, 'H': 1
    //     };
    //     return priorityRank[a] - priorityRank[b];
    //   }

    public queueOrSendAlert(alert: Alert): void {
        const groupId = alert.groupId;
        let state = this.getGroupAlertState(groupId);

        if (!state) {
            state = { alertQueue: [], ongoingAlert: undefined, timeoutHandle: undefined };
            this.setGroupAlertState(groupId, state);
        }
    }
      
}

export default AlertService.getInstance();