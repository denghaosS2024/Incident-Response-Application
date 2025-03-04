import { Router } from 'express';
import { Types } from 'mongoose';

import IncidentController from '../controllers/IncidentController';
/**
 * @swagger
 * components:
 *   schemas:
 *     Incident:
 *       type: object
 *       properties:
 *         incidentId:
 *           type: string
 *           description: Unique identifier for the incident (e.g., IZoe)
 *           example: IZoe
 *         caller:
 *           type: string
 *           description: Username of the 911 caller
 *           example: zoe
 *         openingDate:
 *           type: string
 *           format: date-time
 *           description: Date and time when incident was created
 *         incidentState:
 *           type: string
 *           enum: [Waiting, Triage, Assigned, Closed]
 *           description: Current state of the incident
 *         owner:
 *           type: string
 *           description: Owner of the incident
 *           example: System
 *         commander:
 *           type: string
 *           description: Commander of the incident
 *           example: System
 *         incidentCallGroup:
 *           type: string
 *           format: uuid
 *           description: ID of the associated chat channel
 *           nullable: true
 *       required:
 *         - incidentId
 *         - caller
 *         - openingDate
 *         - incidentState
 *         - owner
 *         - commander
 */
export default Router()
    /**
        * @swagger
        * tags:
        *   name: Incidents
        *   description: Incident management API
        * /api/incidents:
        *   post:
        *     summary: Create a new incident.
        *     tags: [Incidents]
        *     security:
        *       - bearerAuth: []
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               username:
        *                 type: string
        *                 description: The username associated with the incident.
        *                 example: zoe
        *     responses:
        *       201:
        *         description: The newly created incident.
        *         content:
        *           application/json:
        *             schema:
        *               $ref: '#/components/schemas/Incident'
        *       400:
        *         description: Bad request, the incident could not be created.
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
        const { username } = request.body
       
        try {
            const result = await IncidentController.create(username)
            response.status(201).send(result)
        } catch (e) {
            const error = e as Error
            response.status(400).send({ message: error.message })
        }
    })

    // TODO: Sawgger documentation
    .post('/new', async (request, response) => {
        const { incident } = request.body

        try {
            const result = await IncidentController.createIncident(incident)
            response.status(201).send(result)
        } catch (e) {
            const error = e as Error
            response.status(400).send({ message: error.message })
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
    .get('/:username/active', async (request, response) => {
        try {
            const result = await IncidentController.getActiveIncident(request.params.username)
            if (!result) {
                response.status(404).json({ message: 'No active incident found' })
                return
            }
            response.json(result)
        } catch (e) {
            const error = e as Error
            response.status(500).json({ message: error.message })
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
    .put('/:incidentId/chat-group', async (request, response) => {
        try {
            const result = await IncidentController.updateChatGroup(
                request.params.incidentId,
                new Types.ObjectId(request.body.channelId)
            )
            if (!result) {
                response.status(404).json({ message: 'Incident not found' })
                return
            }
            response.json(result)
        } catch (e) {
            const error = e as Error
            response.status(400).json({ message: error.message })
        }
    })