import { Request, Response, Router } from 'express'
import TruckController from '../controllers/TruckController'
import { ITruck } from '../models/Truck'
const truckRouter = Router()

/**
 * @swagger
 * /api/trucks:
 *   get:
 *     summary: Get all trucks
 *     description: Retrieves a list of all available trucks sorted by name.
 *     tags:
 *       - Trucks
 *     responses:
 *       200:
 *         description: A list of trucks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Truck"
 *       500:
 *         description: Server error while fetching trucks.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
truckRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { name } = _req.query
    if (name) {
      const car: ITruck | null = await TruckController.getTruckByName(name as string)
      res.json(car)
      return
    }
    const trucks = await TruckController.getAllTrucks()
    res.json(trucks)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/trucks/availability:
 *   get:
 *     summary: Get available trucks with responders
 *     description: Retrieves a list of available trucks that have responders assigned.
 *     tags:
 *       - Trucks
 *     responses:
 *       200:
 *         description: A list of available trucks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Truck"
 *       500:
 *         description: Server error while fetching available trucks.
 */
truckRouter.get('/availability', async (_req: Request, res: Response) => {
  try {
    const trucks = await TruckController.getAvailableTrucksWithResponder()
    res.json(trucks)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/trucks:
 *   post:
 *     summary: Create a new truck
 *     description: Adds a new truck to the system.
 *     tags:
 *       - Trucks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Fire Truck 1"
 *                 description: The name of the truck to add.
 *     responses:
 *       201:
 *         description: Truck successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Truck"
 *       400:
 *         description: Invalid input or missing truck name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
truckRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const newTruck = await TruckController.createTruck(name)
    res.status(201).json(newTruck)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/trucks/{id}:
 *   delete:
 *     summary: Delete a truck
 *     description: Removes a truck from the system by its ID.
 *     tags:
 *       - Trucks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the truck.
 *     responses:
 *       200:
 *         description: Truck successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Truck deleted"
 *                 truck:
 *                   $ref: "#/components/schemas/Truck"
 *       400:
 *         description: Invalid truck ID or truck not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
truckRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const removedTruck = await TruckController.removeTruckById(id)
    res.json({ message: 'Truck deleted', truck: removedTruck })
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/trucks/cities:
 *   put:
 *     summary: Update the assigned city for a truck
 *     description: Assigns or removes a truck from a city.
 *     tags:
 *       - Trucks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - truckName
 *               - cityName
 *             properties:
 *               truckName:
 *                 type: string
 *                 example: "Fire Truck 1"
 *               cityName:
 *                 type: string
 *                 example: "San Francisco"
 *                 description: Name of the city to assign. Pass `null` to remove truck from a city.
 *     responses:
 *       200:
 *         description: Truck updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Truck"
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 */
truckRouter.put('/cities', async (req: Request, res: Response) => {
  try {
    const { truckName, cityName } = req.body
    const updatedTruck = await TruckController.updateTruckCity(
      truckName,
      cityName,
    )
    res.json(updatedTruck)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/trucks/usernames:
 *   put:
 *     summary: Add a username to a truck
 *     description: Assigns a username to a truck as the commanding incident.
 *     tags:
 *       - Trucks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - truckName
 *               - username
 *               - commandingIncident
 *             properties:
 *               truckName:
 *                 type: string
 *                 example: "Fire Truck 1"
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               commandingIncident:
 *                 type: object
 *                 description: The incident object commanding by the current user
 *     responses:
 *       200:
 *         description: Truck updated successfully.
 *         content:
 *           application/json:
 *       400:
 *         description: Error adding username to truck
 */
truckRouter.put('/usernames', async (req: Request, res: Response) => {
  try {
    const { truckName, username, commandingIncident } = req.body
    const updatedTruck = await TruckController.addUsernameToTruck(truckName, username, commandingIncident)
    res.status(200).json(updatedTruck)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ message: error.message })
  }
})

/**
 * @swagger
 * /trucks/usernames/release:
 *   put:
 *     summary: Release a username from a truck
 *     description: Removes the association between a username and a truck
 *     tags:
 *       - Trucks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - truckName
 *               - username
 *             properties:
 *               truckName:
 *                 type: string
 *                 description: The name of the truck
 *               username:
 *                 type: string
 *                 description: The username to release from the truck
 *     responses:
 *       200:
 *         description: Username successfully released from truck
 *         content:
 *           application/json:
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
truckRouter.put('/usernames/release', async (req: Request, res: Response) => {
  try {
    const { truckName, username } = req.body
    const updatedTruck = await TruckController.releaseUsernameFromTruck(
      truckName,
      username,
    )
    res.status(200).json(updatedTruck)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

export default truckRouter
