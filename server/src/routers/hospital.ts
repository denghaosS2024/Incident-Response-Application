import { Router } from 'express'
import { ObjectId } from 'mongoose'
import HospitalController from '../controllers/HospitalController'
import PatientController from '../controllers/PatientController'
import type { IHospital } from '../models/Hospital'
import HttpError from '../utils/HttpError'
import UserConnections from '../utils/UserConnections'

export default Router()
  /**
   * @swagger
   * /api/hospital/register:
   *   post:
   *     summary: Register a new hospital
   *     description: Register a new hospital
   *     tags: [Hospital]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: objectq
   *               - hospitalName
   *               - hospitalAddress
   *             properties:
   *               hospitalName:
   *                 type: string
   *               hospitalAddress:
   *                 type: string
   *     responses:
   *       201:
   *         description: Hospital registered successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Server error
   */
  .post('/register', async (request, response) => {
    try {
      const hospitalData = request.body as IHospital
      if (!hospitalData.hospitalName || !hospitalData.hospitalAddress) {
        return response.status(400).send({
          message: 'hospitalName and hospitalAddress are mandatory fields.',
        })
      }
      const result = await HospitalController.create(hospitalData)
      UserConnections.broadcast('registerHospital', result)
      return response.status(201).send(result)
    } catch (e) {
      const error = e as Error
      return response.status(500).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/hospital:
   *   get:
   *     summary: Get all hospitals
   *     description: Get all hospitals
   *     tags: [Hospital]
   *     parameters:
   *       - in: query
   *         name: hospitalId
   *         description: ID of the hospital
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Hospitals retrieved
   *       404:
   *         description: No hospital found
   *       500:
   *         description: Server error
   */
  .get('/', async (request, response) => {
    try {
      const { hospitalId } = request.query
      if (hospitalId) {
        const result = await HospitalController.getHospitalById(
          hospitalId as string,
        )
        if (!result) {
          return response.status(404).json({ message: 'No Hospital found.' })
        }
        return response.status(200).json(result)
      }
      const allHospitals = await HospitalController.getAllHospitals()
      return response.status(200).json(allHospitals)
    } catch (e) {
      const error = e as Error
      return response.status(500).json({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/hospital:
   *   put:
   *     summary: Update a hospital
   *     description: Update a hospital
   *     tags: [Hospital]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               hospitalId:
   *                 type: string
   *                 description: ID of the hospital
   *             required:
   *               - hospitalId
   *     responses:
   *       200:
   *         description: Hospital updated successfully
   *       404:
   *         description: No hospital found
   *       500:
   *         description: Server error
   */
  .put('/', async (request, response) => {
    try {
      const hospitalData = request.body as Partial<IHospital>

      const result = await HospitalController.updateHospital(hospitalData)

      if (!result) {
        return response.status(404).send({ message: 'No Hospital found.' })
      }

      return response.status(200).send(result)
    } catch (e) {
      const error = e as Error
      return response.status(500).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/hospital/patients/batch:
   *   patch:
   *     summary: Update multiple hospitals patients
   *     description: Update multiple hospitals' patients at the same time
   *     tags: [Hospital]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 hospitalId:
   *                   type: string
   *                   description: ID of the hospital
   *                 nurses:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: List of nurse IDs to assign
   *             required:
   *               - hospitalId
   *     responses:
   *       200:
   *         description: Hospitals updated successfully
   *       400:
   *         description: Invalid request data
   *       500:
   *         description: Server error
   */
  .patch('/patients/batch', async (request, response) => {
    try {
      const updates = request.body as {
        hospitalId: string
        patients: string[]
      }[]

      // Step 1: Validate input data
      validateBatchUpdates(updates)

      // Step 2: Fetch current hospital data
      const currentHospitalData = await fetchCurrentHospitalData(updates)
      console.log('Current hospital data:', currentHospitalData)

      // Step 3: Update hospitals and patients
      const results = await updateHospitalsAndPatients(updates)

      // Step 4: Broadcast updates
      broadcastHospitalUpdates(updates, currentHospitalData)

      // Step 5: Return success response
      return response.status(200).send(results)
    } catch (e) {
      const error = e as HttpError
      console.error(
        'Error updating multiple hospitals:',
        error.stack || error.message,
      )

      if (error instanceof HttpError) {
        return response
          .status(error.statusCode)
          .send({ message: error.message })
      }

      return response.status(500).send({ message: 'Internal Server Error' })
    }
  })

  /**
   * @swagger
   * /api/hospital:
   *   delete:
   *     summary: Delete a hospital
   *     description: Delete a hospital by providing the hospitalId as a query parameter.
   *     tags: [Hospital]
   *     parameters:
   *       - in: query
   *         name: hospitalId
   *         description: ID of the hospital to delete
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Hospital deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 hospital:
   *                   $ref: '#/components/schemas/Hospital'
   *       400:
   *         description: Bad Request - hospitalId query parameter is required.
   *       404:
   *         description: No Hospital found with the provided hospitalId.
   *       500:
   *         description: Server error
   */
  .delete('/', async (request, response) => {
    try {
      const { hospitalId } = request.query
      if (!hospitalId) {
        return response
          .status(400)
          .json({ message: 'hospitalId query parameter is required.' })
      }
      const deletedHospital = await HospitalController.deleteHospital(
        hospitalId as string,
      )
      if (!deletedHospital) {
        return response.status(404).json({ message: 'No Hospital found.' })
      }

      UserConnections.broadcast('deleteHospital', hospitalId)
      return response.status(200).json({
        message: 'Hospital deleted successfully',
        hospital: deletedHospital,
      })
    } catch (e) {
      const error = e as Error
      return response.status(500).json({ message: error.message })
    }
  })

// supporting function
interface UpdatePayload {
  hospitalId: string
  patients: string[]
}

const validateBatchUpdates = (updates: UpdatePayload[]): void => {
  if (!Array.isArray(updates)) {
    console.error('Invalid request data:', updates)
    throw new HttpError('Invalid request data', 400)
  }

  for (const update of updates) {
    if (!update.hospitalId) {
      console.error('Invalid hospitalId in update:', update)
      throw new HttpError('Invalid hospitalId in update data', 400)
    }
  }
}

const fetchCurrentHospitalData = async (updates: { hospitalId: string }[]) => {
  return Promise.all(
    updates.map(async (update) => {
      const hospital = await HospitalController.getHospitalById(
        update.hospitalId,
      )
      if (!hospital) {
        console.error(`Hospital with ID ${update.hospitalId} does not exist`)
        throw new HttpError(
          `Hospital with ID ${update.hospitalId} does not exist`,
          404,
        )
      }
      return {
        hospitalId: update.hospitalId,
        currentPatients: hospital.patients.map((patient) => patient.toString()),
      }
    }),
  )
}

const updateHospitalsAndPatients = async (
  updates: { hospitalId: string; patients: string[] }[],
) => {
  const results = await HospitalController.updateMultipleHospitals(updates)

  const patientUpdatePromises = updates.flatMap((update) =>
    update.patients.map(async (patientId) => {
      const updatedPatient = await PatientController.setHospital(
        patientId,
        update.hospitalId,
      )
      if (!updatedPatient) {
        throw new HttpError(
          `Failed to update patient with ID ${patientId}`,
          404,
        )
      }
      return updatedPatient
    }),
  )

  await Promise.all(patientUpdatePromises)

  return results
}

const broadcastHospitalUpdates = (
  updates: { hospitalId: string; patients: string[] }[],
  currentHospitalData: { hospitalId: string; currentPatients: string[] }[],
) => {
  const arraysEqual = (
    arr1: (string | ObjectId)[],
    arr2: (string | ObjectId)[],
  ): boolean => {
    const set1 = new Set(arr1.map((item) => item.toString()))
    const set2 = new Set(arr2.map((item) => item.toString()))
    return (
      set1.size === set2.size && [...set1].every((value) => set2.has(value))
    )
  }

  updates.forEach((update) => {
    const currentData = currentHospitalData.find(
      (data) => data.hospitalId === update.hospitalId,
    )

    if (
      currentData &&
      !arraysEqual(currentData.currentPatients, update.patients)
    ) {
      try {
        UserConnections.broadcastToHospitalRoom(
          update.hospitalId,
          'hospital-patients-modified',
          {
            message: `Hospital ${update.hospitalId} has been updated.`,
            hospitalId: update.hospitalId,
            patients: update.patients,
          },
        )
      } catch (error) {
        console.error(
          `Failed to broadcast update for hospital ID: ${update.hospitalId}`,
          error,
        )
      }
    }
  })
}
