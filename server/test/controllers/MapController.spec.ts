import MapController from '../../src/controllers/MapController';
import { close, connect } from '../utils/TestDatabase';

describe('MapController', () => {
  beforeAll(connect);
  afterAll(close);

  let markerId: string;

  it('should add a new map marker', async () => {
    const type = 'pin';
    const latitude = 40.7128;
    const longitude = -74.0060;
    const description = 'Test Marker';

    const marker = await MapController.addMarker(type, latitude, longitude, description);
    markerId = marker._id.toString();

    expect(marker).toBeDefined();
    expect(marker.type).toBe(type);
    expect(marker.latitude).toBe(latitude);
    expect(marker.longitude).toBe(longitude);
    expect(marker.description).toBe(description);
  });

  it('should not add a marker with missing required fields', async () => {
    expect.assertions(1);
    try {
      await MapController.addMarker('', 0, 0);
    } catch (e) {
      const error = e as Error;
      expect(error.message).toMatch(/Failed to add marker/);
    }
  });

  it('should list all markers', async () => {
    const markers = await MapController.listMarkers();
    expect(Array.isArray(markers)).toBeTruthy();
    expect(markers.length).toBeGreaterThan(0);
  });

  it('should update a marker description', async () => {
    const newDescription = 'Updated Description';
    const updatedMarker = await MapController.updateDescription(markerId, newDescription);

    expect(updatedMarker).toBeDefined();
    expect(updatedMarker.description).toBe(newDescription);
  });

  it('should fail to update a non-existent marker', async () => {
    expect.assertions(1);
    try {
        await MapController.updateDescription('000000000000000000000000', 'New Description');
    } catch (e) {
      const error = e as Error;
      expect(error.message).toMatch(/Marker with ID 000000000000000000000000 not found/);
    }
  });

  it('should remove a marker', async () => {
    const response = await MapController.removeMarker(markerId);
    expect(response.message).toBe(`Marker ${markerId} removed successfully`);
  });

  it('should fail to remove a non-existent marker', async () => {
    expect.assertions(1);
    try {
        await MapController.removeMarker('000000000000000000000000');
    } catch (e) {
      const error = e as Error;
      expect(error.message).toMatch(/Marker with ID 000000000000000000000000 not found/);

    }
  });
});
