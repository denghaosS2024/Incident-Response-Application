import { Router } from 'express'
import { Types } from 'mongoose'

import IncidentController from '../controllers/IncidentController'
import type { IIncident } from '../models/Incident'
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

    /**
     * @swagger
     * /api/incidents/new:
     *   post:
     *     summary: Create a new incident
     *     tags: [Incidents]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Incident'
     *     responses:
     *       201:
     *         description: Incident created successfully
     *       400:
     *         description: Bad request (Invalid data)
     */
    .post('/new', async (request, response) => {
        const incident = request.body as IIncident
        console.log('Incident:', incident)

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
     * /api/incidents/update:
     *   put:
     *     summary: Update an existing incident
     *     tags: [Incidents]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Incident'
     *     responses:
     *       204:
     *         description: Incident updated successfully (No Content)
     *       400:
     *         description: Bad request (Invalid data)
     */
    .put('/update', async (request, response) => {
        const incidentData: IIncident = request.body
        console.log('Updating Incident Data:', incidentData)
        try {
            await IncidentController.updateIncident(incidentData)
            response.status(204).send()
        } catch (e) {
            const error = e as Error
            console.error('Error updating incident:', error)
            // Return 404 if the incident is not found
            if (error.message.includes('not found')) {
                response.status(404).send({ message: error.message })
            } else {
                response.status(400).send({ message: error.message })
            }
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
            const result = await IncidentController.getActiveIncident(
                request.params.username,
            )
            if (!result) {
                response
                    .status(404)
                    .json({ message: 'No active incident found' })
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
    .put('/:id/chat-group', async (request, response) => {
        try {
            const result = await IncidentController.updateChatGroup(
                new Types.ObjectId(request.params.id),
                new Types.ObjectId(request.body.channelId),
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

    /**
     * @swagger
     * /api/incidents/{incidentId}/responders-group:
     *   put:
     *     summary: Create or update the responders chat group for an incident.
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the incident.
     *     responses:
     *       200:
     *         description: Incident updated successfully with the responders chat group.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Incident'
     *       400:
     *         description: Bad request, error occurred while creating or updating the responders chat group.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Error message here.
     *       404:
     *         description: Incident not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Incident not found
     */
    .put('/:incidentId/responders-group', async (request, response) => {
        try {
            const { incidentId } = request.params
            const incidents: IIncident[] =
                await IncidentController.getIncidentByIncidentId(incidentId)
            if (!incidents || incidents.length === 0) {
                response.status(404).json({ message: 'Incident not found' })
                return
            }
            const incident = incidents[0]
            const updatedIncident =
                await IncidentController.createOrUpdateRespondersGroup(incident)
            response.status(200).json(updatedIncident)
        } catch (e) {
            const error = e as Error
            response.status(400).json({ message: error.message })
        }
    })


        /**
     * @swagger
     * /api/incidents/sar:
     *   get:
     *     summary: Get incidents for SAR functionality by owner and type S
     *     tags: [Incidents]
     *     parameters:
     *       - in: query
     *         name: owner
     *         required: true
     *         schema:
     *           type: string
     *         description: Owner of the SAR incidents
     *     responses:
     *       200:
     *         description: SAR incidents retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Incident'
     *       204:
     *         description: No SAR incidents found
     *       400:
     *         description: Owner parameter is required
     *       500:
     *         description: Internal server error
     */
    .get('/sar', async (request, response) => {
        try {
            const { owner } = request.query
            
            if (!owner) {
                return response.status(400).json({ 
                    message: 'Owner parameter is required' 
                })
            }
            
            const result = await IncidentController.getSARIncidentsByOwner(
                owner as string
            )
            
            if (!result || result.length === 0) {
                return response
                    .status(204)
                    .json({ message: 'No SAR incidents found' })
            }
            
            return response.json(result)
        } catch (e) {
            const error = e as Error
            return response.status(500).json({ message: error.message })
        }
    })

    /**
     * @swagger
     * /api/incidents/:
     *   get:
     *     summary: Get all incidents or incident based on specified query parameter
     *     tags: [Incidents]
     *     description: >
     *       Returns an array of incidents. If a **caller** query parameter is provided, the endpoint returns
     *       all incidents created by that caller. If an **incidentId** query parameter is provided, it returns
     *       details for the specific incident. If no query parameters are provided, it returns all incidents.
     *     parameters:
     *       - in: query
     *         name: caller
     *         required: false
     *         schema:
     *           type: string
     *         description: Filter incidents by caller.
     *       - in: query
     *         name: incidentId
     *         required: false
     *         schema:
     *           type: string
     *         description: Retrieve incident details by incidentId.
     *       - in: query
     *         name: channelId
     *         required: false
     *         schema:
     *          type: string
     *         description: Retrieve incident details by channelId.
     *       - in: query
     *         name: commander
     *         required: false
     *         schema:
     *          type: string
     *         description: Retrieve incident details by commander.
     *     responses:
     *       200:
     *         description: Incidents retrieved successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Incident'
     *       204:
     *         description: No incidents found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: No incidents found
     *       404:
     *         description: No incident found for the given incidentId.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: No incidents found
     *       500:
     *         description: Internal server error.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    .get('/', async (request, response) => {
        try {
            const { caller } = request.query
            const { incidentId } = request.query
            const { channelId } = request.query
            const { commander } = request.query

            if (commander) {
                const result = await IncidentController.getIncidentByCommander(
                    commander as string,
                )
                return result && result.length > 0
                    ? response.json(result)
                    : response.json([])
            }

            let result
            if (caller) {
                result = await IncidentController.getIncidentsByCaller(
                    caller as string,
                )
            } else if (incidentId) {
                result = await IncidentController.getIncidentByIncidentId(
                    incidentId as string,
                )
                if (!result || result.length === 0) {
                    response.status(404).json({ message: 'No incidents found' })
                    return
                }
            } else if (channelId) {
                result = await IncidentController.getIncidentByChannelId(
                    channelId as string,
                )
                if (!result || result.length === 0) {
                    response.status(404).json({ message: 'No incidents found' })
                    return
                }
            } else {
                result = await IncidentController.getAllIncidents()
            }

            if (!result || result.length === 0) {
                return response
                    .status(204)
                    .json({ message: 'No incidents found' })
            }

            return response.json(result)
        } catch (e) {
            const error = e as Error
            return response.status(500).json({ message: error.message })
        }
    })

    /**
     * @swagger
     * /api/incidents/{id}/vehicles:
     *   put:
     *     summary: Add a vehicle to an incident
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the incident to update
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               personnel:
     *                 type: string
     *                 description: The personnel to assign the vehicle to
     *                 example: john_doe
     *               commandingIncident:
     *                 type: object
     *                 description: The incident object commanding by the current user
     *               vehicle:
     *                 type: string
     *                 description: The vehicle to assign to the incident
     *                 example: Car123
     *     responses:
     *       200:
     *         description: Vehicle added to incident successfully
     *       400:
     *         description: Error adding vehicle to incident: {error message}
     */
    .put('/vehicles', async (request, response) => {
        const { personnel, commandingIncident, vehicle } = request.body

        try {
            const result = await IncidentController.addVehicleToIncident(
                personnel,
                commandingIncident,
                vehicle,
            )
            response.status(200).json(result)
        } catch (e) {
            const error = e as Error
            response.status(400).json({ message: error.message })
        }
    })
    /**
     * @swagger
     * /api/incidents/{incidentId}:
     *   delete:
     *     summary: Close an incident by incidentId
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         description: The `incidentId` (e.g., "ITest") to close the incident
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Incident closed successfully
     *       404:
     *         description: Incident not found
     *       500:
     *         description: Internal server error
     */
    .delete('/:incidentId', async (request, response) => {
        const { incidentId } = request.params
        try {
            const result = await IncidentController.closeIncident(incidentId)
            if (!result) {
                response.status(404).json({ message: 'Incident not found' })
                return
            }
            response.status(200).json(result)
        } catch (e) {
            const error = e as Error
            response.status(500).json({ message: error.message })
        }
    })

    /**
     * @swagger
     * /api/incidents/updatedVehicles:
     *   put:
     *     summary: Bulk update assigned vehicles in incidents and append to history
     *     tags: [Incidents]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               incidents:
     *                 type: array
     *                 description: Array of incident objects to update
     *                 items:
     *                   type: object
     *                   properties:
     *                     incidentId:
     *                       type: string
     *                       example: I123456
     *                     commander:
     *                       type: string
     *                       example: test_user
     *                     assignedVehicles:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           name:
     *                             type: string
     *                             example: Car123
     *                           type:
     *                             type: string
     *                             enum: [Car, Truck]
     *                             example: Car
     *                           usernames:
     *                             type: array
     *                             items:
     *                               type: string
     *                               example: john_doe
     *     responses:
     *       200:
     *         description: All incidents updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: success
     *       500:
     *         description: Internal server error during incident update
     */
    .put('/updatedVehicles', async (request, response) => {
        const { incidents } = request.body
        try {
            for (const incident of incidents[0]) {
                console.log(incident)
                await IncidentController.updateVehicleHistory(incident)
            }
            response.status(200).json({ message: 'success' })
        } catch (e) {
            const error = e as Error
            response.status(500).json({ message: error.message })
        }
    })
