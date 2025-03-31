
class AlertService {
    private static instance: AlertService;

    private constructor() {}

    public static getInstance(): AlertService {
        if (!AlertService.instance) {
            AlertService.instance = new AlertService();
        }
        return AlertService.instance;
    }
    
}

export default AlertService.getInstance();