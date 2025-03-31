import AlertService from '../../src/services/AlertService';

describe('AlertService', () => {
    it('should return the same instance on repeated access', () => {
      const instance1 = AlertService;
      const instance2 = AlertService;
  
      expect(instance1).toBe(instance2);
    });
  });