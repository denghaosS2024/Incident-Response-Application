import { Types } from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import AlertService from '../../src/services/AlertService';

describe('Alert Queue Router', () => {
  const mockChannelId = new Types.ObjectId().toString();
  
  beforeEach(() => {
    // Mock AlertService.queueOrSendAlert
    jest.spyOn(AlertService, 'queueOrSendAlert').mockResolvedValue('Alert queued successfully');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('POST /:id', () => {
    it('should queue or send an alert', async () => {
      const alertData = {
        id: new Types.ObjectId().toString(),
        senderId: new Types.ObjectId().toString(),
        patientId: 'patient123',
        patientName: 'John Doe',
        priority: 'E',
        numNurses: 2,
        createdAt: new Date(),
        numNurseAccepted: 0
      };

      const response = await request(app)
        .post(`/api/alertQueue/${mockChannelId}`)
        .send(alertData)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('message', 'Alert queued successfully');
      expect(response.body).toHaveProperty('alert');
      
      // Verify alert properties
      const responseAlert = response.body.alert;
      expect(responseAlert).toMatchObject({
        id: alertData.id,
        patientId: alertData.patientId,
        patientName: alertData.patientName,
        numNurse: alertData.numNurses,
        priority: alertData.priority,
        groupId: mockChannelId,
        senderId: alertData.senderId,
        numNurseAccepted: 0
      });

      // Verify AlertService was called correctly
      expect(AlertService.queueOrSendAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: alertData.id,
          patientId: alertData.patientId,
          patientName: alertData.patientName,
          numNurse: alertData.numNurses,
          priority: alertData.priority,
          groupId: mockChannelId,
          senderId: alertData.senderId,
          numNurseAccepted: 0
        })
      );
    });   
  });
});
