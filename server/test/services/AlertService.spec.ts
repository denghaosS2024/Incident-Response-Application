import { Alert, GroupAlertState } from '../../src/models/AlertQueue';
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

    it('should queue alert for existing group', () => {
        const groupId = 'group-123';
        const alertService = AlertService;
        const alert: Alert = {
            id: '123',
            patientId: '123',
            patientName: 'test',
            numNurse: 1,
            priority: 'E',
            createdAt: new Date(),
            groupId: groupId,
            status: 'waiting',
        };
        
        alertService.setGroupAlertState(groupId, {
            alertQueue: [],
            ongoingAlert: undefined,
            timeoutHandle: undefined,
        });

        alertService.queueAlert(alert);
        const groupAlertState = alertService.getGroupAlertState(groupId);
        expect(groupAlertState?.alertQueue).toEqual([alert]);
    });

    it('should create group alert state and queue alert if it does not exist when queue alert', () => {
        const groupId = 'group-new';
        const alertService = AlertService;
        const alert: Alert = {
            id: '123',
            patientId: '123',
            patientName: 'test',
            numNurse: 1,
            priority: 'E',
            createdAt: new Date(),
            groupId: groupId,
            status: 'waiting',
        };

        alertService.queueAlert(alert);
        const groupAlertState = alertService.getGroupAlertState(groupId);
        expect(groupAlertState?.alertQueue).toEqual([alert]);
    });

    it('should send alert when there is no ongoing alert', () => {
        const groupId = 'group-send';
        const alertService = AlertService;
        const alert: Alert = {
            id: '123',
            patientId: '123',
            patientName: 'test',
            numNurse: 1,
            priority: 'E',
            createdAt: new Date(),
            groupId: groupId,
            status: 'waiting',
        };
        
        alertService.setGroupAlertState(groupId, {
            alertQueue: [],
            ongoingAlert: undefined,
            timeoutHandle: undefined,
        });

        alertService.queueAlert(alert);
        const groupAlertState = alertService.getGroupAlertState(groupId);
        expect(groupAlertState?.alertQueue).toEqual([alert]);

        alertService.sendAlert(groupId);
        const groupAlertStateAfter = alertService.getGroupAlertState(groupId);
        expect(groupAlertStateAfter?.alertQueue).toEqual([]);
        expect(groupAlertStateAfter?.ongoingAlert).toEqual(alert);
    });

    it('queue or send alert should set default state if group alert state is not set', () => {
        const groupId = 'group-default';
        const alertService = AlertService;
        const alert: Alert = {
            id: '123',
            patientId: '123',
            patientName: 'test',
            numNurse: 1,
            priority: 'E',
            createdAt: new Date(),
            groupId: groupId,
            status: 'waiting',
        }
        AlertService.queueOrSendAlert(alert)
        // expect getGroupAlertState to be called
        expect(alertService.getGroupAlertState).toHaveBeenCalledWith(groupId);
        // expect setGroupAlertState to be called
        expect(alertService.setGroupAlertState).toHaveBeenCalledWith(groupId, {
            alertQueue: [],
            ongoingAlert: undefined,
            timeoutHandle: undefined,
        });
    })
  });

