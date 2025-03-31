import { GroupAlertState } from '../../src/models/AlertQueue';
import AlertService from '../../src/services/AlertService';

describe('AlertService', () => {
    it('should return the same instance on repeated access', () => {
      const instance1 = AlertService;
      const instance2 = AlertService;
  
      expect(instance1).toBe(instance2);
    });

    it('should return undefined if group alert state is not set', () => {
        const groupId = '123';
        const alertService = AlertService;
        const groupAlertState = alertService.getGroupAlertState(groupId);
        expect(groupAlertState).toBeUndefined();
    });

    it('should set and get group alert state', () => {
        const groupId = '123';
        const alertService = AlertService;

        const testGroupAlertState: GroupAlertState = {
            alertQueue: [],
            ongoingAlert: undefined,
            timeoutHandle: undefined,
        };

        alertService.setGroupAlertState(groupId, testGroupAlertState);
        const groupAlertState = alertService.getGroupAlertState(groupId);
        expect(groupAlertState).toEqual(testGroupAlertState);
    });
  });

