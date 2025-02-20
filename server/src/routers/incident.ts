import { Router } from 'express'

import IncidentController from '../controllers/IncidentController'

export default Router()
    /**
        * @swagger
        * tags:
        *   name: Incidents
        *   description: Incident management API
        * /api/incidents:
        *   post:
        *     summary: Create a new incident.
        *     description: Creates an incident based on the provided username.
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
        *       200:
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
            response.send(result)
        } catch (e) {
            const error = e as Error
            response.status(400).send({ message: error.message })
        }
    })