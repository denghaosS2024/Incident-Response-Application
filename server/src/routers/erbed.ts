import { Router } from 'express'
import ERBedController from '../controllers/ERBedController'
import { ERBedStatus } from '../models/ERBed'

export default Router()
  /**
   * @swagger
   * /api/erbed/hospital/{hospitalId}:
   *   get:
   *     summary: Get all ER beds for a specific hospital
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the hospital
   *     responses:
   *       200:
   *         description: A list of ER beds
   *       404:
   *         description: Hospital not found
   *       500:
   *         description: Server error
   */
  .get('/hospital/:hospitalId', async (request, response) => {
    try {
      const { hospitalId } = request.params
      const beds = await ERBedController.getHospitalBeds(hospitalId)
      return response.status(200).json(beds)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to get hospital beds' })
    }
  })

  /**
   * @swagger
   * /api/erbed/hospital/{hospitalId}/available:
   *   get:
   *     summary: Get the count of available ER beds for a specific hospital
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the hospital
   *     responses:
   *       200:
   *         description: The count of available beds
   *       500:
   *         description: Server error
   */
  .get('/hospital/:hospitalId/available', async (request, response) => {
    try {
      const { hospitalId } = request.params
      const count = await ERBedController.getAvailableBedCount(hospitalId)
      return response.status(200).json({ availableBeds: count })
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to get available bed count' })
    }
  })

  /**
   * @swagger
   * /api/erbed/hospital/{hospitalId}/status/{status}:
   *   get:
   *     summary: Get all ER beds with a specific status for a hospital
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the hospital
   *       - in: path
   *         name: status
   *         schema:
   *           type: string
   *           enum: [requested, ready, in_use, discharged]
   *         required: true
   *         description: Status of the beds to retrieve
   *     responses:
   *       200:
   *         description: A list of ER beds with the specified status
   *       400:
   *         description: Invalid status
   *       500:
   *         description: Server error
   */
  .get('/hospital/:hospitalId/status/:status', async (request, response) => {
    try {
      const { hospitalId, status } = request.params

      // Validate status
      if (!Object.values(ERBedStatus).includes(status as ERBedStatus)) {
        return response.status(400).json({ message: 'Invalid bed status' })
      }

      const beds = await ERBedController.getHospitalBedsByStatus(
        hospitalId,
        status as ERBedStatus,
      )
      return response.status(200).json(beds)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to get beds by status' })
    }
  })

  /**
   * @swagger
   * /api/erbed/patient/{patientId}:
   *   get:
   *     summary: Get the ER bed for a specific patient
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: patientId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the patient
   *     responses:
   *       200:
   *         description: The patient's ER bed
   *       404:
   *         description: No bed found for patient
   *       500:
   *         description: Server error
   */
  .get('/patient/:patientId', async (request, response) => {
    try {
      const { patientId } = request.params
      const bed = await ERBedController.getPatientBed(patientId)

      if (!bed) {
        return response
          .status(404)
          .json({ message: 'No bed found for patient' })
      }

      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message })
      }
      return response.status(500).json({ message: 'Failed to get patient bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/hospital/{hospitalId}:
   *   post:
   *     summary: Create a new ER bed in a hospital
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the hospital
   *     responses:
   *       201:
   *         description: The newly created ER bed
   *       404:
   *         description: Hospital not found
   *       500:
   *         description: Server error
   */
  .post('/hospital/:hospitalId', async (request, response) => {
    try {
      const { hospitalId } = request.params
      const newBed = await ERBedController.createBed(hospitalId)
      return response.status(201).json(newBed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response.status(500).json({ message: 'Failed to create ER bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/request:
   *   post:
   *     summary: Request an ER bed for a patient
   *     tags: [ERBed]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - hospitalId
   *               - patientId
   *               - requestedBy
   *             properties:
   *               hospitalId:
   *                 type: string
   *               patientId:
   *                 type: string
   *               requestedBy:
   *                 type: string
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: Invalid request
   *       404:
   *         description: Hospital or patient not found
   *       500:
   *         description: Server error
   */
  .post('/request', async (request, response) => {
    try {
      const { hospitalId, patientId, requestedBy } = request.body

      if (!hospitalId || !patientId || !requestedBy) {
        return response.status(400).json({
          message: 'hospitalId, patientId, and requestedBy are required',
        })
      }

      const bed = await ERBedController.requestBed(
        hospitalId,
        patientId,
        requestedBy,
      )
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (
          error.message.includes('already has an ER bed') ||
          error.message.includes('No available ER beds')
        ) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response.status(500).json({ message: 'Failed to request ER bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}/cancel:
   *   post:
   *     summary: Cancel an ER bed request
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: Cannot cancel a bed that is not in requested status
   *       404:
   *         description: Bed not found
   *       500:
   *         description: Server error
   */
  .post('/:bedId/cancel', async (request, response) => {
    try {
      const { bedId } = request.params
      const bed = await ERBedController.cancelBedRequest(bedId)
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (error.message.includes('Cannot cancel')) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to cancel bed request' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}/status:
   *   put:
   *     summary: Update the status of an ER bed
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [requested, ready, in_use, discharged]
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: Invalid status or status transition
   *       404:
   *         description: Bed not found
   *       500:
   *         description: Server error
   */
  .put('/:bedId/status', async (request, response) => {
    try {
      const { bedId } = request.params
      const { status } = request.body

      if (!status || !Object.values(ERBedStatus).includes(status)) {
        return response.status(400).json({ message: 'Invalid status' })
      }

      const bed = await ERBedController.updateBedStatus(bedId, status)
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (error.message.includes('Invalid status transition')) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to update bed status' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}/patient:
   *   put:
   *     summary: Assign a patient to an ER bed
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   *             properties:
   *               patientId:
   *                 type: string
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: Bed already assigned to another patient
   *       404:
   *         description: Bed or patient not found
   *       500:
   *         description: Server error
   */
  .put('/:bedId/patient', async (request, response) => {
    try {
      const { bedId } = request.params
      const { patientId } = request.body

      if (!patientId) {
        return response.status(400).json({ message: 'patientId is required' })
      }

      const bed = await ERBedController.assignPatientToBed(bedId, patientId)
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (error.message.includes('already assigned')) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to assign patient to bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}/patient:
   *   delete:
   *     summary: Remove a patient from an ER bed
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: No patient assigned to this bed
   *       404:
   *         description: Bed not found
   *       500:
   *         description: Server error
   */
  .delete('/:bedId/patient', async (request, response) => {
    try {
      const { bedId } = request.params
      const bed = await ERBedController.removePatientFromBed(bedId)
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (error.message.includes('No patient assigned')) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to remove patient from bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}:
   *   delete:
   *     summary: Delete an ER bed
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     responses:
   *       200:
   *         description: Bed successfully deleted
   *       400:
   *         description: Cannot delete a bed with an assigned patient
   *       404:
   *         description: Bed not found
   *       500:
   *         description: Server error
   */
  .delete('/:bedId', async (request, response) => {
    try {
      const { bedId } = request.params
      await ERBedController.deleteBed(bedId)
      return response.status(200).json({ message: 'Bed successfully deleted' })
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (
          error.message.includes('Cannot delete a bed with an assigned patient')
        ) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response.status(500).json({ message: 'Failed to delete bed' })
    }
  })

  /**
   * @swagger
   * /api/erbed/hospital/{hospitalId}/patients:
   *   get:
   *     summary: Get patients grouped by ER bed category for a hospital
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: hospitalId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the hospital
   *     responses:
   *       200:
   *         description: Patients categorized by bed status
   *       500:
   *         description: Server error
   */
  .get('/hospital/:hospitalId/patients', async (request, response) => {
    try {
      const { hospitalId } = request.params
      const categorizedPatients =
        await ERBedController.getPatientsByCategory(hospitalId)
      return response.status(200).json(categorizedPatients)
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to get patients by category' })
    }
  })

  /**
   * @swagger
   * /api/erbed/{bedId}/category:
   *   put:
   *     summary: Move a patient from one bed category to another
   *     tags: [ERBed]
   *     parameters:
   *       - in: path
   *         name: bedId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the bed
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - targetStatus
   *             properties:
   *               targetStatus:
   *                 type: string
   *                 enum: [requested, ready, in_use, discharged]
   *     responses:
   *       200:
   *         description: The updated ER bed
   *       400:
   *         description: Invalid status transition
   *       404:
   *         description: Bed or patient not found
   *       500:
   *         description: Server error
   */
  .put('/:bedId/category', async (request, response) => {
    try {
      const { bedId } = request.params
      const { targetStatus } = request.body

      if (!targetStatus || !Object.values(ERBedStatus).includes(targetStatus)) {
        return response.status(400).json({ message: 'Invalid target status' })
      }

      const bed = await ERBedController.movePatientToCategory(
        bedId,
        targetStatus,
      )
      return response.status(200).json(bed)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return response.status(404).json({ message: error.message })
        }
        if (
          error.message.includes('Invalid status transition') ||
          error.message.includes('No patient assigned')
        ) {
          return response.status(400).json({ message: error.message })
        }
        return response.status(500).json({ message: error.message })
      }
      return response
        .status(500)
        .json({ message: 'Failed to move patient to category' })
    }
  })
