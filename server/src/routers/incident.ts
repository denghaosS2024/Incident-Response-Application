import { Router } from 'express'
import { Types } from 'mongoose'

import IncidentController from '../controllers/IncidentController'
import type { IIncident } from '../models/Incident'
import Incident from '../models/Incident'
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
                    message: 'Owner parameter is required',
                })
            }

            const result = await IncidentController.getSARIncidentsByOwner(
                owner as string,
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
     * /api/incidents/sar/{incidentId}:
     *   put:
     *     summary: Update SAR task details for a SAR incident
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         schema:
     *           type: string
     *         description: The unique identifier of the SAR incident
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               sarTask:
     *                 type: object
     *                 properties:
     *                   state:
     *                     type: string
     *                     enum: [Todo, InProgress, Done]
     *                   startDate:
     *                     type: string
     *                     format: date-time
     *     responses:
     *       200:
     *         description: SAR task updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Incident'
     *       400:
     *         description: Bad request - Invalid input
     *       404:
     *         description: SAR incident not found
     */
    .put('/sar/:incidentId', async (request, response) => {
        try {
            const { incidentId } = request.params
            const { taskId, sarTask } = request.body

            if (!sarTask) {
                return response.status(400).json({
                    message: 'sarTask is required for updating a SAR incident',
                })
            }

            const incidents =
                await IncidentController.getIncidentByIncidentId(incidentId)

            if (!incidents || incidents.length === 0) {
                return response
                    .status(404)
                    .json({ message: 'Incident not found' })
            }

            if (incidents[0].type !== 'S') {
                return response.status(400).json({
                    message: 'This is not a SAR type incident',
                })
            }

            const currentIncident = incidents[0]
            const updatedSarTasks = [...(currentIncident.sarTasks || [])]
            updatedSarTasks[taskId] = sarTask

            const updatedIncident = await IncidentController.updateIncident({
                incidentId: incidentId,
                sarTasks: updatedSarTasks,
            })

            return response.status(200).json(updatedIncident)
        } catch (e) {
            const error = e as Error
            return response.status(400).json({ message: error.message })
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
     *       - in: query
     *         name: incidentState
     *         required: false
     *         schema:
     *          type: string
     *         description: Retrieve incident details by incidentState.
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
            const { incidentState } = request.query

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
            } else if (incidentState) {
                result = await IncidentController.getIncidentByIncidentState(
                    incidentState as string,
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
     * /incidents/vehicles:
     *   put:
     *     summary: Add a vehicle to an incident
     *     description: Assigns a vehicle to an incident and associates personnel with the vehicle
     *     tags:
     *       - Incidents
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - personnel
     *               - commandingIncident
     *               - vehicle
     *             properties:
     *               personnel:
     *                 type: object
     *                 required:
     *                   - _id
     *                   - name
     *                   - assignedCity
     *                   - role
     *                 properties:
     *                   _id:
     *                     type: string
     *                     description: Personnel ID
     *                   name:
     *                     type: string
     *                     description: Personnel name
     *                   assignedCity:
     *                     type: string
     *                     description: City assigned to the personnel
     *                   role:
     *                     type: string
     *                     enum: [Fire, Police]
     *                     description: Role of the personnel
     *                   assignedVehicleTimestamp:
     *                     type: string
     *                     nullable: true
     *                     format: date-time
     *                     description: Timestamp when personnel was assigned to a vehicle
     *                   assignedCar:
     *                     type: string
     *                     description: Car assigned to personnel
     *                   assignedTruck:
     *                     type: string
     *                     description: Truck assigned to personnel
     *                   assignedIncident:
     *                     type: string
     *                     description: Incident assigned to personnel
     *               commandingIncident:
     *                 type: object
     *                 description: The incident to which the vehicle will be assigned
     *                 required:
     *                   - _id
     *                   - incidentId
     *                 properties:
     *                   _id:
     *                     type: string
     *                     description: MongoDB ID of the incident
     *                   incidentId:
     *                     type: string
     *                     description: Unique identifier for the incident
     *               vehicle:
     *                 type: object
     *                 description: The vehicle to assign to the incident
     *                 required:
     *                   - name
     *                   - type
     *                 properties:
     *                   name:
     *                     type: string
     *                     description: Name of the vehicle
     *                   type:
     *                     type: string
     *                     enum: [Car, Truck]
     *                     description: Type of vehicle
     *                   usernames:
     *                     type: array
     *                     items:
     *                       type: string
     *                     description: List of personnel assigned to this vehicle
     *                   assignedIncident:
     *                     type: string
     *                     description: ID of incident currently assigned to this vehicle
     *     responses:
     *       200:
     *         description: Vehicle successfully added to incident
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                 incidentId:
     *                   type: string
     *                 assignedVehicles:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       type:
     *                         type: string
     *                         enum: [Car, Truck]
     *                       name:
     *                         type: string
     *                       usernames:
     *                         type: array
     *                         items:
     *                           type: string
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
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

    /**
     * @swagger
     * /api/incidents/{incidentId}/sar-task:
     *   get:
     *     summary: Get SAR tasks for an incident
     *     tags: [Incidents]
     *     parameters:
     *       - in: path
     *         name: incidentId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of SAR tasks
     *       404:
     *         description: Incident not found
     *       500:
     *         description: Server error
     */
    .get('/:incidentId/sar-task', async (request, response) => {
        try {
            const { incidentId } = request.params

            // Find the incident
            const incident = await Incident.findOne({ incidentId }).exec()

            if (!incident) {
                return response
                    .status(404)
                    .json({
                        error: `Incident with ID '${incidentId}' not found`,
                    })
            }

            // Return the SAR tasks array
            return response.json(incident.sarTasks || [])
        } catch (error) {
            const errorMessage = error as Error
            console.error('Error getting SAR tasks:', error)

            if (
                errorMessage.message &&
                errorMessage.message.includes('not found')
            ) {
                return response
                    .status(404)
                    .json({ error: errorMessage.message })
            }

            return response
                .status(500)
                .json({
                    error: errorMessage.message || 'Internal server error',
                })
        }
    })

    /**
     * @swagger
     * /api/incidents/{incidentId}/sar-task:
     *   post:
     *     summary: Create a new SAR task for an incident
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
     *             required:
     *               - state
     *             properties:
     *               state:
     *                 type: string
     *                 enum: [Todo, InProgress, Done]
     *               location:
     *                 type: string
     *               coordinates:
     *                 type: object
     *                 properties:
     *                   latitude:
     *                     type: number
     *                   longitude:
     *                     type: number
     *               startDate:
     *                 type: string
     *                 format: date-time
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *             required:
     *               - state
     *     responses:
     *       200:
     *         description: Updated incident with new SAR task
     *       400:
     *         description: Invalid request
     *       404:
     *         description: Incident not found
     *       500:
     *         description: Server error
     */
    .post('/:incidentId/sar-task', async (request, response) => {
        try {
            const { incidentId } = request.params
            const {
                state,
                location,
                coordinates,
                startDate,
                name,
                description,
                hazards,
                victims,
            } = request.body

            // Validate required fields
            if (!state) {
                return response
                    .status(400)
                    .json({ error: 'State is required for SAR task' })
            }

            // Validate state enum values
            if (!['Todo', 'InProgress', 'Done'].includes(state)) {
                return response.status(400).json({
                    error: 'Invalid state value. Must be one of: Todo, InProgress, Done',
                })
            }

            const sarTaskData = {
                state,
                location,
                coordinates,
                startDate: startDate ? new Date(startDate) : undefined,
                name,
                description,
                hazards,
                victims,
            }

            const updatedIncident =
                await IncidentController.createOrUpdateSarTask(
                    incidentId,
                    sarTaskData,
                )

            // Return the updated list of SAR tasks
            return response.json(updatedIncident?.sarTasks || [])
        } catch (error) {
            const errorMessage = error as Error
            console.error('Error creating/updating SAR task:', error)

            if (
                errorMessage.message &&
                errorMessage.message.includes('not found')
            ) {
                return response
                    .status(404)
                    .json({ error: errorMessage.message })
            }

            return response
                .status(500)
                .json({
                    error: errorMessage.message || 'Internal server error',
                })
        }
    })

    /**
     * @swagger
     * /api/incidents/{incidentId}/history:
     *   get:
     *     summary: Get the history of an incident
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
     *         description: Incident history retrieved successfully.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   timestamp:
     *                     type: string
     *                     format: date-time
     *                   commander:
     *                     type: string
     *                   incidentState:
     *                     type: string
     *       404:
     *         description: Incident not found.
     *       500:
     *         description: Internal server error.
     */
    .get('/:incidentId/history', async (request, response) => {
        try {
            const { incidentId } = request.params
            const incident =
                await IncidentController.getIncidentByIncidentId(incidentId)

            if (!incident || incident.length === 0) {
                response.status(404).json({ message: 'Incident not found' })
                return
            }

            response.json(incident[0].incidentStateHistory || [])
        } catch (e) {
            const error = e as Error
            response.status(500).json({ message: error.message })
        }
    })
