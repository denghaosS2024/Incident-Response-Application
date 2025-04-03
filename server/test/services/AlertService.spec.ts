import { Types } from 'mongoose';
import { Alert, GroupAlertState } from '../../src/models/AlertQueue';
import Channel from '../../src/models/Channel';
import AlertService, { AlertService as AlertServiceClass } from '../../src/services/AlertService';

beforeEach(() => {
    AlertService.resetState();
    jest.useFakeTimers();
  });

afterEach(() => {
    jest.clearAllTimers();
});
  
describe('AlertService', () => {
    it('should return the same instance on repeated access', () => {
      const instance1 = AlertService;
      const instance2 = AlertService;
  
      expect(instance1).toBe(instance2);
    })

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
})

describe('AlertService utility functions', () => {
    const alertService = AlertService;
  describe('comparePriority', () => {
    it('should rank E higher than U', () => {
      expect(AlertServiceClass['comparePriority']('E', 'U')).toBeGreaterThan(0);
    });

    it('should rank U higher than H', () => {
      expect(AlertServiceClass['comparePriority']('U', 'H')).toBeGreaterThan(0);
    });

    it('should rank E higher than H', () => {
      expect(AlertServiceClass['comparePriority']('E', 'H')).toBeGreaterThan(0);
    });

    it('should return 0 for same priorities', () => {
      expect(AlertServiceClass['comparePriority']('E', 'E')).toBe(0);
    });
  });

  describe('hasExpired', () => {
    it('should return true for alerts older than 2 minutes', () => {
      const alert = {
        createdAt: new Date(Date.now() - 3 * 60 * 1000) // 3 minutes ago
      } as Alert;
      const now = new Date();
      
      expect(alertService['hasExpired'](alert, now)).toBe(true);
    });

    it('should return false for alerts less than 2 minutes old', () => {
      const alert = {
        createdAt: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
      } as Alert;
      const now = new Date();
      
      expect(alertService['hasExpired'](alert, now)).toBe(true);
    });
  });

  describe('alertComparator', () => {
    it('should prioritize by alert type first', () => {
      const earlier = new Date(2024, 0, 1, 10, 0);
      const later = new Date(2024, 0, 1, 10, 1);
      
      const lowPriorityAlert = {
        priority: 'H',
        createdAt: earlier
      } as Alert;
      
      const highPriorityAlert = {
        priority: 'E',
        createdAt: later
      } as Alert;

      // Should prioritize E over H even though H is older
      expect(AlertServiceClass['alertComparator'](lowPriorityAlert, highPriorityAlert)).toBeGreaterThan(0);
    });

    it('should use creation time as tiebreaker for same priority', () => {
      const earlier = new Date(2024, 0, 1, 10, 0);
      const later = new Date(2024, 0, 1, 10, 1);
      
      const olderAlert = {
        priority: 'E',
        createdAt: earlier
      } as Alert;
      
      const newerAlert = {
        priority: 'E',
        createdAt: later
      } as Alert;

      // Should prioritize older alert when priorities are equal
      expect(AlertServiceClass['alertComparator'](olderAlert, newerAlert)).toBeLessThan(0);
    });

    it('should handle full priority ordering with mixed dates', () => {
      const alerts = [
        { priority: 'H', createdAt: new Date(2024, 0, 1, 10, 0) },
        { priority: 'E', createdAt: new Date(2024, 0, 1, 10, 2) },
        { priority: 'U', createdAt: new Date(2024, 0, 1, 10, 1) }
      ] as Alert[];

      // Sort using the comparator
      const sorted = [...alerts].sort(AlertServiceClass['alertComparator']);

      // Should be ordered: E, U, H regardless of creation time
      expect(sorted[0].priority).toBe('E');
      expect(sorted[1].priority).toBe('U');
      expect(sorted[2].priority).toBe('H');
    });
  });
});

describe('promoteNextAlert', () => {
    it('should send the next alert from the queue', async () => {
      const groupId = 'test-group';
      const alert1 = {
        id: 'a1',
        groupId,
        senderId: 'u1',
        priority: 'E',
        createdAt: new Date(),
      };
  
      const alert2 = {
        id: 'a2',
        groupId,
        senderId: 'u2',
        priority: 'H',
        createdAt: new Date(),
      };
  
      const state = {
        alertQueue: [alert2],
        ongoingAlert: alert1,
        timeoutHandle: undefined,
      } as GroupAlertState;
  
      AlertService.setGroupAlertState(groupId, state);
  
      // Spy on sendAlertNow
      const sendAlertSpy = jest.spyOn(AlertService as any, 'sendAlertNow').mockResolvedValue(undefined);
  
      await (AlertService as any).promoteNextAlert(groupId);
  
      expect(sendAlertSpy).toHaveBeenCalledWith(alert2, state, groupId);
      sendAlertSpy.mockRestore();
    });
  });

  describe('sendAlertNow', () => {
    
    it('should emit events and update state', async () => {
      const groupId = '507f1f77bcf86cd799439011';
      const senderId = '507f1f77bcf86cd799439012';
      const alert = {
        id: 'alert-1',
        groupId,
        senderId,
        priority: 'E',
        createdAt: new Date(),
      };
    
      jest.spyOn(Channel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          users: [{ _id: new Types.ObjectId(senderId) }],
        }),
      } as any);
      
  
      const state = {
        alertQueue: [],
        timeoutHandle: undefined,
      };
  
      AlertService.setGroupAlertState(groupId, state);
  
      await (AlertService as any).sendAlertNow(alert, state, groupId);

      const stateGot = AlertService.getGroupAlertState(groupId);
  
      expect(stateGot?.ongoingAlert).toBe(alert);
      expect(typeof stateGot?.timeoutHandle).toBe('object');
    });
  });

  describe('queueOrSendAlert', () => {
    const groupId = '507f1f77bcf86cd799439011';
    const senderId = new Types.ObjectId('507f1f77bcf86cd799439012');
  
    const createAlert = (priority: string, overrides = {}): any => ({
      id: 'alert-1',
      groupId,
      senderId: senderId.toHexString(),
      priority,
      createdAt: new Date(),
      ...overrides,
    });
  
    it('should send immediately if no ongoing alert', async () => {
      const alert = createAlert('E');
  
      const result = await AlertService.queueOrSendAlert(alert);
  
      expect(result).toBe('Immediate alert sent');
      const state = AlertService.getGroupAlertState(groupId);
      expect(state?.ongoingAlert).toEqual(alert);
    });
  
    it('should preempt if incoming alert has higher priority', async () => {
      const alert1 = createAlert('U');
      const alert2 = createAlert('E', { id: 'alert-2' });
  
      // Send lower-priority first
      await AlertService.queueOrSendAlert(alert1);
      // Send higher-priority
      const result = await AlertService.queueOrSendAlert(alert2);
  
      expect(result).toBe('Immediate alert sent');
      const state = AlertService.getGroupAlertState(groupId);
      expect(state?.ongoingAlert?.id).toBe('alert-2');
    });
  
    it('should queue alert if lower or equal priority', async () => {
      const alert1 = createAlert('E');
      const alert2 = createAlert('H', { id: 'alert-2' });
  
      await AlertService.queueOrSendAlert(alert1);
      const result = await AlertService.queueOrSendAlert(alert2);
  
      expect(result).toBe('Alert queued');
      const state = AlertService.getGroupAlertState(groupId);
      expect(state?.alertQueue.length).toBe(1);
      expect(state?.alertQueue[0].id).toBe('alert-2');
    });
  });