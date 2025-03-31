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
        }
    }
}

export default AlertService.getInstance();