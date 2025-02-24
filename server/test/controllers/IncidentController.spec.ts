import * as TestDatabase from '../utils/TestDatabase';
import IncidentController from '../../src/controllers/IncidentController';
import Incident from '../../src/models/Incident'
import { Types } from 'mongoose';

describe('Incident Controller', () => {
    beforeAll(TestDatabase.connect);
    beforeEach(() => jest.clearAllMocks());
    afterEach(() => jest.restoreAllMocks());
    afterAll(TestDatabase.close);

    const createTestIncident = async (username: string) => {
        const rawIncident = new Incident({
            incidentId: `I${username}`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'System',
            commander: 'System',
        });

        return rawIncident.save();
    };

    it('will create a new incident', async () => {
        const username: string = 'test-username-1';
        const newIncident = await IncidentController.create(username);

        expect(newIncident).toBeDefined();
        expect(newIncident.incidentId).toBe(`I${username}`);
        expect(newIncident.caller).toBe(username);
        expect(newIncident.incidentState).toBe('Waiting');
    });

    // TODO in the future: check if the state is not closed
    it('will prevent duplicate incidents', async () => {
        const username: string = 'test-username-2';
        await createTestIncident(username);

        await expect(IncidentController.create(username)).rejects.toThrow(
            `Incident "I${username}" already exists`
        );
    });

    it('should return active incident for user', async () => {
        const username = 'test-user-active';
        await createTestIncident(username);
        
        const result = await IncidentController.getActiveIncident(username);
        
        expect(result).toBeDefined();
        expect(result?.caller).toBe(username);
        expect(result?.incidentState).not.toBe('Closed');
    });

    it('should return null if no active incident exists', async () => {
        const result = await IncidentController.getActiveIncident('non-existent-user');
        expect(result).toBeNull();
    });

    it('should not return closed incidents', async () => {
        const username = 'test-user-closed';
        const incident = await createTestIncident(username);
        await Incident.findByIdAndUpdate(incident._id, { incidentState: 'Closed' });
        
        const result = await IncidentController.getActiveIncident(username);
        expect(result).toBeNull();
    });

    it('should update incident with chat group', async () => {
        const username = 'test-user-chat';
        const incident = await createTestIncident(username);
        const channelId = new Types.ObjectId();

        const result = await IncidentController.updateChatGroup(
            incident.incidentId,
            channelId
        );

        expect(result).toBeDefined();
        expect(result?.incidentCallGroup?.toString()).toBe(channelId.toString());
    });

    it('should return null if incident not found', async () => {
        const result = await IncidentController.updateChatGroup(
            'non-existent-id',
            new Types.ObjectId()
        );
        expect(result).toBeNull();
    });
})