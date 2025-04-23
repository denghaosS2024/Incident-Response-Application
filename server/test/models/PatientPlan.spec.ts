import PatientPlan from '../../src/models/PatientPlan';

describe('PatientPlan Model Unit Test', () => {
  it('should require patientId', async () => {
    const plan = new PatientPlan({});
    try {
      await plan.validate();
    } catch (e: any) {
      expect(e.errors.patientId).toBeDefined();
    }
  });

  it('should default to empty medications and exercises', () => {
    const plan = new PatientPlan({ patientId: '123' });
    expect(plan.medications).toEqual([]);
    expect(plan.exercises).toEqual([]);
  });
});
