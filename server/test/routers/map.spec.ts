import request from 'supertest';

import app from '../../src/app';
import * as TestDatabase from '../utils/TestDatabase';

describe('Router - Map', () => {
  beforeAll(TestDatabase.connect);

  const createMarker = () => {
    return request(app)
      .post('/api/map')
      .send({
        type: 'pin',
        latitude: 40.7128,
        longitude: -74.0060,
        description: 'Test Marker',
      });
  };

  let markerId: string;

  it('can create a new map marker', async () => {
    const { body: marker } = await createMarker().expect(200);
    markerId = marker.id;

    expect(marker).toMatchObject({
      id: /.+/,
      type: 'pin',
      latitude: 40.7128,
      longitude: -74.0060,
      description: 'Test Marker',
    });
  });

  it('will list all map markers', async () => {
    const { body } = await request(app).get('/api/map').expect(200);
    expect(body.length).toBeGreaterThan(0);
  });

  it('will update the marker description', async () => {
    const newDescription = 'Updated Description';
    const { body: updatedMarker } = await request(app)
      .patch(`/api/map/${markerId}`)
      .send({ description: newDescription })
      .expect(200);

    expect(updatedMarker.description).toBe(newDescription);
  });

  it('will delete a marker', async () => {
    const { body } = await request(app).delete(`/api/map/${markerId}`).expect(200);
    expect(body.message).toBe(`Marker ${markerId} removed successfully`);
  });

  afterAll(TestDatabase.close);
});
