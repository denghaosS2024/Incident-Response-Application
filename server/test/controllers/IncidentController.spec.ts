import * as TestDatabase from '../utils/TestDatabase'
import IncidentController from '../../src/controllers/IncidentController'
import Incident from '../../src/models/Incident'

describe('Incident Controller', () => {
    beforeAll(TestDatabase.connect)
    beforeEach(() => jest.clearAllMocks())
    afterEach(() => jest.restoreAllMocks())
    afterAll(TestDatabase.close)

    const createTestIncident = async (username: string) => {
        const rawIncident = new Incident({
            incidentId: `I${username}`,
            caller: username,
            openingDate: new Date(),
            incidentState: 'Waiting',
            owner: 'System',
            commander: 'System',
        })

        return rawIncident.save()
    }

    it('will create a new incident', async () => {
        const username: string = 'test-username-1'
        const newIncident = await IncidentController.create(username)

        expect(newIncident).toBeDefined()
        expect(newIncident.incidentId).toBe(`I${username}`)
        expect(newIncident.caller).toBe(username)
        expect(newIncident.incidentState).toBe('Waiting')
    })

    // TODO in the future: check if the state is not closed
    it('will prevent duplicate incidents', async () => {
        const username: string = 'test-username-2'
        await createTestIncident(username)

        await expect(IncidentController.create(username)).rejects.toThrow(
            `Incident "I${username}" already exists`
        )
    })
})