import { GroupAlertState } from "../models/AlertQueue";
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
    
}

export default AlertService.getInstance();