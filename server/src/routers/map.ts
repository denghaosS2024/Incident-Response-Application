import { Router } from 'express';
import MapController from '../controllers/MapController';

export default Router()
  /**
   * Add a new MapMarker
   * @route POST /api/map
   * @param {Object} request.body
   * @param {string} request.body.type - The type of the marker (e.g., pin, fire hydrant, roadblock)
   * @param {number} request.body.latitude - The latitude of the marker
   * @param {number} request.body.longitude - The longitude of the marker
   * @param {string} [request.body.description] - (Optional) A description for the marker
   * @returns {Object} The created MapMarker object
   * @throws {400} If marker creation fails
   */
  .post('/', async (request, response) => {
    const { type, latitude,  longitude, description } = request.body;
    
    try {
      const marker = await MapController.addMarker(type, latitude, longitude, description);
      response.send({
        id: marker._id,
        type: marker.type,
        latitude: marker.latitude,
        longitude: marker.longitude,
        description: marker.description
      });
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })
  
  /**
   * Remove a MapMarker by ID
   * @route DELETE /api/map/:id
   * @param {string} request.params.id - The ID of the marker to remove
   * @returns {Object} A success message upon successful deletion
   * @throws {400} If the marker is not found or deletion fails
   */
  .delete('/:id', async (request, response) => {
    const { id } = request.params;
    
    try {
      const result = await MapController.removeMarker(id);
      response.send(result);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })
  
  /**
   * List all MapMarkers
   * @route GET /api/map
   * @returns {Array} An array of all MapMarker objects
   * @throws {400} If listing fails
   */
  .get('/', async (_, response) => {
    try {
      const markers = await MapController.listMarkers();
      response.send(markers);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Update the description of a MapMarker
   * @route PATCH /api/map/:id
   * @param {string} request.params.id - The ID of the marker to update
   * @param {string} request.body.description - The new description
   * @returns {Object} The updated MapMarker object
   * @throws {400} If the marker is not found or update fails
   */
  .patch('/:id', async (request, response) => {
    const { id } = request.params;
    const { description } = request.body;
    
    try {
      const updatedMarker = await MapController.updateDescription(id, description);
      response.send(updatedMarker);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  });
