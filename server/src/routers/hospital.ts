import { Router } from 'express'
import HospitalController from '../controllers/HospitalController'
import type { IHospital } from '../models/Hospital'
import HttpError from '../utils/HttpError'

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
      // TODO : Trigger a socket event here to update all screens
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

      if (!Array.isArray(updates)) {
        return response.status(400).send({ message: 'Invalid request data' })
      }

      const results = await HospitalController.updateMultipleHospitals(updates)

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
