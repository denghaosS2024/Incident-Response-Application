import { Router } from 'express'

import PatientController from '../controllers/PatientController'

export default Router()
  /**
   * @swagger
   * /api/patients:
   *   post:
   *     summary: Create a new patient
   *     description: Create a new patient
   *     tags: [Patient]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - age
   *             properties:
   *               name:
   *                 type: string
   *               age:
   *                 type: number
   *     responses:
   *       201:
   *         description: Patient created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Patient'
   *       400:
   *         description: Bad request
   */
  .post('/', async (request, response) => {
    try {
      console.log('Here!')
      const result = await PatientController.create(request.body)
      response.status(201).send(result)
    } catch (e) {
      const error = e as Error
      response.status(400).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients:
   *   put:
   *     summary: Update a patient's name
   *     description: Update a patient's name
   *     tags: [Patient]
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
   */
  .put('/', async (request, response) => {
    const { patientId } = request.body

    try {
      const result = await PatientController.update(patientId, request.body)
      if (!result) {
        response.status(404).json({ message: 'the update operation failed' })
        return
      }
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  .put('/priority', async (request, response) => {
    const { patientId, priority } = request.body

    try {
      const result = await PatientController.setPriority(patientId, priority)
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients/status:
   *   put:
   *     summary: Update a patient's status
   *     description: Update a patient's status
   *     tags: [Patient]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   *               - status
   *             properties:
   *               patientId:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Patient status updated
   *       400:
   *         description: Bad request
   */
  .put('/status', async (request, response) => {
    const { patientId, status } = request.body

    try {
      const result = await PatientController.setERStatus(patientId, status)
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients:
   *   delete:
   *     summary: Delete a patient
   *     description: Delete a patient
   *     tags: [Patient]
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
   *         description: Patient deleted
   *       400:
   *         description: Bad request
   */
  .delete('/', async (request, response) => {
    try {
      const patientId = request.query['patientId']
      if (patientId === undefined) {
        response.status(400).json({ message: 'patientId is required' })
        return
      }

      const result = await PatientController.delete(patientId.toString())
      if (!result) {
        response.status(404).json({ message: 'Patient not found' })
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
   * /api/patients/nurse:
   *   post:
   *     summary: Set a patient's nurse
   *     description: Set a patient's nurse
   *     tags: [Patient]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   *               - nurseId
   *             properties:
   *               patientId:
   *                 type: string
   *               nurseId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Patient nurse updated
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  .post('/nurse', async (request, response) => {
    const { patientId, nurseId } = request.body

    try {
      const result = await PatientController.setNurse(patientId, nurseId)
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients/hospital:
   *   post:
   *     summary: Set a patient's hospital
   *     description: Set a patient's hospital
   *     tags: [Patient]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   */
  .post('/hospital', async (request, response) => {
    const { patientId, hospitalId } = request.body

    try {
      const result = await PatientController.setHospital(patientId, hospitalId)
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients/single:
   *   get:
   *     summary: >
   *       Get a single patient, if hospitalId or nurseId are present in the document,
   *       their data will be embedded in the response
   *       (So you don't have to join the IDs yourself)
   *     description: Get a single patient
   *     tags: [Patient]
   *     parameters:
   *       - in: query
   *         name: patientId
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Patient retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Patient'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  .get('/single', async (request, response) => {
    const { patientId } = request.query

    try {
      const result = await PatientController.getExpandedPatientInfo(
        patientId as string,
      )
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients:
   *   get:
   *     summary: Get patients. If no parameters are provided, return all patients.
   *     If "patientId" is provided, return the patient with the given ID.
   *     If "hospitalId" is provided, return all patients associated with the given hospital.
   *     description: Retrieve a list of patients, optionally filtered by patient ID or hospital ID.
   *     tags: [Patient]
   *     parameters:
   *       - in: query
   *         name: patientId
   *         description: ID of the patient to retrieve.
   *         required: false
   *         schema:
   *           type: string
   *       - in: query
   *         name: hospitalId
   *         description: ID of the hospital to retrieve patients from.
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Patients retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     description: Unique identifier for the patient.
   *                   name:
   *                     type: string
   *                     description: Name of the patient.
   *                   hospitalId:
   *                     type: string
   *                     description: ID of the hospital the patient is associated with.
   *       400:
   *         description: Invalid request parameters.
   *       500:
   *         description: Internal server error.
   */

  .get('/', async (request, response) => {
    try {
      const { patientId, hospitalId } = request.query
      if (patientId) {
        const result = await PatientController.findById(patientId as string)
        response.json(result)
        return
      }

      if (hospitalId) {
        const result = await PatientController.findByHospitalId(
          hospitalId as string,
        )
        response.json(result)
        return
      }

      // If no query params, return all patients
      const result = await PatientController.getAllPatients()
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(400).json({ message: error.message })
    }
  })

  .get('/unassigned', async (_, response) => {
    try {
      const result = await PatientController.getUnassignedPatients()
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(400).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/patients/visitLogs:
   *   post:
   *     summary: Create a new visit log for a patient
   *     description: >
   *       Adds a new visit log entry to the specified patient. 
   *       If the patient has any existing active visit logs, they will be marked as inactive.
   *       The new visit will be created and marked as active.
   *     tags: [Patient]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientId
   *               - visitLog
   *             properties:
   *               patientId:
   *                 type: string
   *                 description: ID of the patient to add a visit for.
   *                 example: "P12345"
   *               visitLog:
   *                 type: object
   *                 required:
   *                   - incidentId
   *                   - location
   *                 properties:
   *                   dateTime:
   *                     type: string
   *                     format: date-time
   *                     description: ISO string representing the date and time of the visit.
   *                     example: "2025-03-29T14:30:00Z"
   *                   incidentId:
   *                     type: string
   *                     description: ID of the related incident.
   *                     example: "IJaneDoe42"
   *                   location:
   *                     type: string
   *                     enum: [Road, ER]
   *                     description: Location of the visit (Road or ER).
   *                     example: "ER"
   *                   priority:
   *                     type: string
   *                     enum: ["E", "1", "2", "3", "4"]
   *                     description: Priority of the visit. Defaults to "E" (Immediate).
   *                     example: "1"
   *                   age:
   *                     type: number
   *                     description: Age of the patient at the time of the visit.
   *                     example: 34
   *                   conscious:
   *                     type: boolean
   *                     description: Whether the patient was conscious during the visit.
   *                     example: true
   *                   breathing:
   *                     type: boolean
   *                     description: Whether the patient was breathing during the visit.
   *                     example: true
   *                   chiefComplaint:
   *                     type: string
   *                     description: The patient's chief complaint during the visit.
   *                     example: "Severe chest pain"
   *                   condition:
   *                     type: string
   *                     enum:
   *                       - Allergy
   *                       - Asthma
   *                       - Bleeding
   *                       - Broken bone
   *                       - Burn
   *                       - Choking
   *                       - Concussion
   *                       - Covid-19
   *                       - Heart Attack
   *                       - Heat Stroke
   *                       - Hypothermia
   *                       - Poisoning
   *                       - Seizure
   *                       - Shock
   *                       - Strain
   *                       - Sprain
   *                       - Stroke
   *                       - Others
   *                     description: Patient's condition type.
   *                     example: "Heart Attack"
   *                   drugs:
   *                     type: array
   *                     items:
   *                       type: string
   *                     description: List of drugs administered or reported.
   *                     example: ["Aspirin"]
   *                   allergies:
   *                     type: array
   *                     items:
   *                       type: string
   *                     description: List of known allergies.
   *                     example: ["Penicillin"]
   *     responses:
   *       201:
   *         description: Visit log created successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Patient'
   *       400:
   *         description: Missing or invalid patientId or visitLog object.
   *       404:
   *         description: Patient not found.
   *       500:
   *         description: Internal server error.
   */
  .post('/visitLogs', async (request, response) => {
    try {
      const { patientId, visitLog } = request.body
      if (!patientId || !visitLog) {
        response.status(400).json({ message: 'patientId and visitLog are required' })
        return
      }

      const result = await PatientController.createPatientVisit(patientId as string, visitLog)
      response.json(result)
    } catch (e) {
      const error = e as Error
      response.status(500).json({ message: error.message })
    }
  })
