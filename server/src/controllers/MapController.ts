import MapMarker from '../models/MapMarker';

class MapController {
  /**
   * Add a new MapMarker
   * @param type - The type of the marker (e.g., pin, fire hydrant, roadblock)
   * @param latitude - The latitude of the marker
   * @param longitude - The longitude of the marker
   * @param description - (Optional) A description for the marker
   * @returns The newly created MapMarker object
   * @throws Error if marker creation fails
   */
  async addMarker(
    type: string,
    latitude: number,
    longitude: number,
    description?: string
  ) {
    try {
      const marker = new MapMarker({ type, latitude, longitude, description });
      await marker.save();
      return marker;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to add marker: ${error.message}`);
        }
        throw new Error('Failed to add marker due to an unknown error');
    }
  }

  /**
   * Remove a MapMarker by its ID
   * @param markerId - The ID of the marker to remove
   * @returns A success message upon successful deletion
   * @throws Error if the marker is not found or deletion fails
   */
  async removeMarker(markerId: string) {
    try {
      const marker = await MapMarker.findById(markerId);
      if (!marker) {
        throw new Error(`Marker with ID ${markerId} not found`);
      }
      await marker.deleteOne();
      return { message: `Marker ${markerId} removed successfully` };
    } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to remove marker: ${error.message}`);
        }
        throw new Error('Failed to remove marker due to an unknown error');
      }
  }

  /**
   * List all MapMarkers with their details
   * @returns An array of all markers including id, latitude, longitude, longitude, description, and type
   * @throws Error if listing fails
   */
async listMarkers() {
    try {
      const markers = await MapMarker.find();
      return markers;
    } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to list markers: ${error.message}`);
        }
        throw new Error('Failed to list markers due to an unknown error');
      }
  }

async updateDescription(markerId: string, description: string) {
    try {
        const marker = await MapMarker.findById(markerId);
        if (!marker) {
            throw new Error(`Marker with ID ${markerId} not found`);
        }
        marker.description = description;
        await marker.save();
        return marker;
    } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to update marker description: ${error.message}`);
        }
        throw new Error('Failed to update marker description due to an unknown error');
      }
}
}

export default new MapController();
