import { Router } from 'express'
import HospitalController from '../controllers/HospitalController'
import type { IHospital } from '../models/Hospital'

export default Router()
  /**
   * @swagger
   * /api/hospitals/register:
   *   post:
   *     summary: Register a new hospital
   *     description: Register a new hospital
   *     tags: [Hospital]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
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
   * /api/hospitals:
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
