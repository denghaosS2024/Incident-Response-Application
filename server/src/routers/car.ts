import { Request, Response, Router } from 'express'
import CarController from '../controllers/CarController'
import { ICar } from '../models/Car'
const carRouter = Router()

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     description: Retrieves a list of all available cars sorted by name.
 *     tags:
 *       - Cars
*      parameters:
*        - in: query
*          name: name
*          required: false
*          schema:
*            type: string
*          description: Filter cars by name.
 *     responses:
 *       200:
 *         description: A list of cars retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Car"
 *       500:
 *         description: Server error while fetching cars.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const { name } = _req.query
    if (name) {
      const car: ICar | null = await CarController.getCarByName(name as string)
      res.json(car)
      return
    }
    const cars = await CarController.getAllCars()
    res.json(cars)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

carRouter.get('/availability', async (_req: Request, res: Response) => {
  try {
    const cars = await CarController.getAvailableCarsWithResponder()
    res.json(cars)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     description: Adds a new car to the system.
 *     tags:
 *       - Cars
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Car123"
 *                 description: The name of the car to add.
 *     responses:
 *       201:
 *         description: Car successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Car"
 *       400:
 *         description: Invalid input or missing car name.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const newCar = await CarController.createCar(name)
    res.status(201).json(newCar)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     description: Removes a car from the system by its ID.
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the car.
 *     responses:
 *       200:
 *         description: Car successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Car deleted"
 *                 car:
 *                   $ref: "#/components/schemas/Car"
 *       400:
 *         description: Invalid car ID or car not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const removedCar = await CarController.removeCarById(id)
    res.json({ message: 'Car deleted', car: removedCar })
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/cars/cities:
 *   put:
 *     summary: Update the assigned city for a car
 *     description: Assigns or removes a car from a city.
 *     tags:
 *       - Cars
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carName
 *               - cityName
 *             properties:
 *               carName:
 *                 type: string
 *                 example: "Car123"
 *               cityName:
 *                 type: string
 *                 example: "San Francisco"
 *                 description: Name of the city to assign. Pass `null` to remove car from a city.
 *     responses:
 *       200:
 *         description: Car updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Car"
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *
 *       404:
 *         description: Car or city not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
carRouter.put('/cities', async (req: Request, res: Response) => {
  try {
    const { carName, cityName } = req.body
    const updatedCar = await CarController.updateCarCity(carName, cityName)
    res.status(200).json(updatedCar)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ error: error.message })
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
carRouter.put('/usernames', async (req: Request, res: Response) => {
  try {
    const { carName, username, commandingIncident } = req.body
    const updatedCar = await CarController.addUsernameToCar(carName, username, commandingIncident)
    res.status(200).json(updatedCar)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ message: error.message })
  }
})

carRouter.put('/usernames/release', async (req: Request, res: Response) => {
  try {
    const { carName, username } = req.body
    const updatedCar = await CarController.releaseUsernameFromCar(
      carName,
      username,
    )
    res.status(200).json(updatedCar)
  } catch (err) {
    const error = err as Error
    res.status(400).json({ message: error.message })
  }
})
export default carRouter
