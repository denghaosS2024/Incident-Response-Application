import { Router } from 'express'

import WildfireAreaController from '../controllers/WildfireAreaController'

export default Router()
  /**
   * @swagger
   * /api/wildfire/areas:
   *   post:
   *     summary: Create a new wildfire area
   *     description: Create a new wildfire area
   *     tags: [WildfireArea]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - coordinates
   *               - name
   *             properties:
   *               coordinates:
   *                 type: array
   *                 items:
   *                   type: number
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Wildfire area created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WildfireArea'
   *       400:
   *         description: Bad request
   */
  .post('/areas', async (request, response) => {
    const { areaId, coordinates, name } = request.body

    try {
      const result = await WildfireAreaController.add(areaId, coordinates, name)
      response.status(201).send(result)
    } catch (e) {
      const error = e as Error
      response.status(400).send({ message: error.message })
    }
  })

  /**
   * @swagger
   * /api/wildfire/areas:
   *   put:
   *     summary: Update a wildfire area's name
   *     description: Update a wildfire area's name
   *     tags: [WildfireArea]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - areaId
   *               - name
   *             properties:
   *               areaId:
   *                 type: string
   *               name:
   *                 type: string
   */
  .put('/areas', async (request, response) => {
    if (!request.body.areaId || !request.body.name) {
      response.status(400).json({ message: 'areaId and name are required' })
      return
    }

    const { areaId, name } = request.body

    try {
      const result = await WildfireAreaController.update(areaId, name)
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

  /**
   * @swagger
   * /api/wildfire/areas/containment:
   *   put:
   *     summary: Update a wildfire area's containment level
   *     description: Update a wildfire area's containment level
   *     tags: [WildfireArea]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - areaId
   *               - containmentLevel
   *             properties:
   *               areaId:
   *                 type: string
   *               containmentLevel:
   */
  .put('/areas/containment', async (request, response) => {
    if (!request.body.areaId || !request.body.containmentLevel) {
      response
        .status(400)
        .json({ message: 'areaId and containmentLevel are required' })
      return
    }

    const { areaId, containmentLevel } = request.body

    try {
      const result = await WildfireAreaController.updateContainmentLevel(
        areaId,
        containmentLevel,
      )
      if (!result) {
        response.status(404).json({ message: 'the update operation failed' })
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
   * /api/wildfire/areas:
   *   delete:
   *     summary: Delete a wildfire area
   *     description: Delete a wildfire area
   *     tags: [WildfireArea]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - areaId
   *             properties:
   *               areaId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Wildfire area deleted
   *       400:
   *         description: Bad request
   */
  .delete('/areas', async (request, response) => {
    try {
      if (request.query['areaId'] === undefined) {
        response.status(400).json({ message: 'areaId is required' })
        return
      }

      const result = await WildfireAreaController.delete(
        request.query['areaId'].toString(),
      )
      if (!result) {
        response.status(404).json({ message: 'Wildfire Area not found' })
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
   * /api/wildfire/areas:
   *   get:
   *     summary: Get wildfire areas. If no param is provided, return all wildfire areas. If param "areaId" is provided, return the wildfire area with the given ID.
   *     description: Get all wildfire areas
   *     tags: [WildfireArea]
   *     parameters:
   *       - in: query
   *         name: areaId
   *         description: Id of the wildfire area
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Wildfire areas retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   */
  .get('/areas', async (request, response) => {
    try {
      const areaId = request.query['areaId']

      // if no areaId is provided, return all wildfire areas
      // In case the user sends malicious param, ignore such param
      if (areaId !== undefined && areaId !== '' && areaId !== null) {
        const result = await WildfireAreaController.findById(areaId as string)
        response.json(result)
      } else {
        const result = await WildfireAreaController.listWildfireAreas()
        response.json(result)
      }
    } catch (e) {
      const error = e as Error
      response.status(400).json({ message: error.message })
    }
  })
