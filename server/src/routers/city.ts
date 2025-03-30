import { Request, Response, Router } from 'express'
import CityController from '../controllers/CityController'

const cityRouter = Router()

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Get all cities
 *     description: Retrieves a list of all available cities sorted by name.
 *     tags:
 *       - Cities
 *     responses:
 *       200:
 *         description: A list of cities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/City"
 *       500:
 *         description: Server error while fetching cities.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
cityRouter.get('/', async (_req: Request, res: Response) => {
    try {
        const cities = await CityController.getAllCities()
        res.json(cities)
    } catch (err) {
        const error = err as Error
        res.status(500).json({ error: error.message })
    }
})

/**
 * @swagger
 * /cities/{cityName}:
 *   delete:
 *     summary: Remove a city and reset assignedCity for related entities
 *     description: Deletes a city by its name and sets the assignedCity field to null for all related cars, trucks, and personnel.
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city to remove.
 *     responses:
 *       200:
 *         description: Successfully removed the city and reset assignments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "City 'San Francisco' and its assignments have been removed."
 *       404:
 *         description: City not found in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "City 'San Francisco' not found."
 *       500:
 *         description: Internal server error.
 */
cityRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body
        const newCity = await CityController.createCity(name)
        res.status(201).json(newCity)
    } catch (err) {
        const error = err as Error
        res.status(400).json({ error: error.message })
    }
})

/**
 * @swagger
 * /api/cities/{cityId}:
 *   delete:
 *     summary: Remove a city by its ID and reset assignments for associated vehicles and personnel
 *     description: Deletes a city by its ID and resets the `assignedCity` field to `null` for all cars, trucks, and personnel that were associated with it.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         description: The ID of the city to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the city and reset assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "City deleted"
 *                 city:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "City with ID '12345' and its assignments have been removed."
 *       400:
 *         description: Bad request (e.g., city not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "City with ID '12345' not found"
 */
cityRouter.delete('/:cityId', async (req: Request, res: Response) => {
    try {
        const { cityId } = req.params
        const removedCity = await CityController.removeCityById(
            cityId.toString(),
        )
        res.json({ message: 'City deleted', city: removedCity })
    } catch (err) {
        const error = err as Error
        res.status(400).json({ error: error.message })
    }
})

/**
 * @swagger
 * /api/cities/assignments/{cityName}:
 *   get:
 *     summary: Get assignments for a city
 *     description: Retrieves all assignments (cars, trucks, personnel) for a specified city.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city to fetch assignments for.
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Car"
 *                 trucks:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Truck"
 *                 personnel:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Personnel"
 */
cityRouter.get(
    '/assignments/:cityName',
    async (req: Request, res: Response) => {
        try {
            const { cityName } = req.params
            const assignments =
                await CityController.getCityAssignments(cityName)
            res.json(assignments)
        } catch (err) {
            const error = err as Error
            res.status(400).json({ error: error.message })
        }
    },
)

/**
 * @swagger
 * /api/cities/assignments/{cityName}:
 *   put:
 *     summary: Update assignments for a city
 *     description: Assigns or removes a car, truck, or personnel from a specified city.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city to update assignments for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["Car", "Truck", "Personnel"]
 *                 description: The type of assignment to update.
 *               name:
 *                 type: string
 *                 description: The name of the car, truck, or personnel to assign or remove.
 *     responses:
 *       200:
 *         description: Assignments updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/City"
 */
cityRouter.put(
    '/assignments/:cityName',
    async (req: Request, res: Response) => {
        try {
            const { cityName } = req.params
            const { type, name } = req.body
            const updatedCity = await CityController.addCityAssignment(
                cityName,
                type,
                name,
            )
            res.json(updatedCity)
        } catch (err) {
            const error = err as Error
            res.status(400).json({ error: error.message })
        }
    },
)

export default cityRouter
