import { Router } from 'express';
import { Types } from 'mongoose';

import WildfireAreaController from '../controllers/WildfireAreaController';
/**
 * @swagger
 * components:
 *   schemas:
 *     Incident:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: name for the selected wildfire area
 *           example: Danger Zone 1
 *         coordinates:
 *           type: [number, number][]
 *           description: 
 *           example: [[124.32847, -110.186261], [124.31827, -110.112861], [124.30527, -110.107161]]
 *       required:
 *         - coordinates
 */
export default Router()
    /**
        * @swagger
        * tags:
        *   name: WildfireArea
        *   description: WildfireArea management API
        * /api/wildfireAreas:
        *   post:
        *     summary: Create a new wildfire area.
        *     description: Creates a new wildfire area with the provided details.
        *     tags: [WildfireArea]
        *     security:
        *       - bearerAuth: []
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               areaId:
        *                 type: string
        *                 description: The ID of the wildfire area.
        *                 example: 12345
        *               coordinates:
        *                 type: array
        *                 items:
        *                   type: array
        *                   items:
        *                     type: number
        *                 description: The coordinates of the wildfire area.
        *                 example: [[124.32847, -110.186261], [124.31827, -110.112861], [124.30527, -110.107161]]
        *               name:
        *                 type: string
        *                 description: The name of the wildfire area.
        *                 example: Danger Zone 1
        *     responses:
        *       201:
        *         description: The newly created wildfire area.
        *         content:
        *           application/json:
        *             schema:
        *               $ref: '#/components/schemas/WildfireArea'
        *       400:
        *         description: Bad request, the wildfire area could not be created.
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 message:
        *                   type: string
        *                   example: Invalid input or server error.
        */
    .post('/', async (request, response) => {
        const { areaId, coordinates, name } = request.body;

        try {
            const result = await WildfireAreaController.add(areaId, coordinates, name);
            response.status(201).send(result);
        } catch (e) {
            const error = e as Error;
            response.status(400).send({ message: error.message });
        }
    })
    /**
     * @swagger
     * /api/incidents/{username}/active:
     *   get:
     *     summary: Get active incident for a user
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Active incident found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Incident'
     *       404:
     *         description: No active incident found
     */
    .put('/:areaId', async (request, response) => {
        const { name } = request.body;

        try {
            const result = await WildfireAreaController.update(request.params.areaId, name);
            if (!result) {
                response.status(404).json({ message: 'the update operation failed' });
                return;
            }
            response.json(result);
        } catch (e) {
            const error = e as Error;
            response.status(500).json({ message: error.message });
        }
    })

    /**
     * @swagger
     * /api/incidents/{incidentId}/chat-group:
     *   put:
     *     summary: Update incident chat group
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               channelId:
     *                 type: string
     *                 format: uuid
     *     responses:
     *       200:
     *         description: Incident updated with chat group
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Incident'
     *       404:
     *         description: Incident not found
     */
    .delete('/:areaId', async (request, response) => {
        try {
            const result = await WildfireAreaController.delete(request.params.areaId);
            if (!result) {
                response.status(404).json({ message: 'Wildfire Area not found' });
                return;
            }
            response.json(result);
        } catch (e) {
            const error = e as Error;
            response.status(400).json({ message: error.message });
        }
    })


    /**
     * @swagger
     * /api/incidents/{incidentId}/chat-group:
     *   put:
     *     summary: Update incident chat group
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               channelId:
     *                 type: string
     *                 format: uuid
     *     responses:
     *       200:
     *         description: Incident updated with chat group
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Incident'
     *       404:
     *         description: Incident not found
     */
    .get('/:areaId', async (request, response) => {
        try {
            const result = await WildfireAreaController.listWildfireAreas();
            if (!result) {
                response.status(404).json({ message: 'Wildfire Area not found' });
                return;
            }
            response.json(result);
        } catch (e) {
            const error = e as Error;
            response.status(400).json({ message: error.message });
        }
    });