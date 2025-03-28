import { Request, Response, Router } from 'express'
import PersonnelController from '../controllers/PersonnelController'

const personnelRouter = Router()

/**
 * @swagger
 * /api/personnel:
 *   get:
 *     summary: Get all personnel
 *     description: Retrieves a list of all Firefighters and Police Officers.
 *     tags:
 *       - Personnel
 *     responses:
 *       200:
 *         description: A list of personnel retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Personnel"
 *       500:
 *         description: Server error while fetching personnel.
 */
personnelRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const personnel = await PersonnelController.getAllAvailablePersonnel()
    res.json(personnel)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/personnel/cities:
 *   put:
 *     summary: Update the assigned city for a personnel
 *     description: Assigns or removes a personnel from a city.
 *     tags:
 *       - Personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - cityName
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               cityName:
 *                 type: string
 *                 example: "San Francisco"
 *                 description: Name of the city to assign. Pass `null` to remove personnel from a city.
 *     responses:
 *       200:
 *         description: Personnel updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Personnel"
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       404:
 *         description: Personnel or city not found.
 *       500:
 *         description: Server error while updating personnel.
 */
personnelRouter.put('/cities', async (req: Request, res: Response) => {
  try {
    const { username, cityName } = req.body
    const updatedPersonnel = await PersonnelController.updatePersonnelCity(
      username.toString(),
      cityName.toString(),
    )
    res.status(200).json(updatedPersonnel)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/personnel/vehicles:
 *   put:
 *     summary: Update the assigned vehicle for a personnel
 *     description: Assigns or removes a vehicle from a personnel.
 *     tags:
 *       - Personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personnelName
 *               - vehicleName
 *             properties:
 *               personnelName:
 *                 type: string
 *                 example: "john_doe"
 *               commandingIncident:
 *                 type: object
 *                 description: Incident that the personnel is commanding.
 *               vehicle:
 *                 type: object
 *                 description: The vehicle (Car or Truck) to assign. 
 *     responses:
 *       200:
 *         description: Vehicle updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Personnel"
 *       400:
 *         description: Bad request. Missing or invalid parameters.
 *       500:
 *         description: Server error while updating personnel.
 */
personnelRouter.put('/vehicles', async (req: Request, res: Response) => {
  try {
    const { personnelName, commandingIncident, vehicle } = req.body
    const updatedPersonnel =
      await PersonnelController.selectVehicleForPersonnel(
        personnelName.toString(),
        commandingIncident,
        vehicle
      )
    res.status(200).json(updatedPersonnel)
  } catch (err) {
    const error = err as Error
    if (
      error.message.includes('already has a vehicle assigned') ||
      error.message.includes('does not exist') ||
      error.message.includes('from another incident')
    ) {
      // Return 400 Bad Request for validation errors
      res.status(400).json({ message: error.message })
      console.log(error.message)
      return
    }
    res.status(500).json({ message: error.message })
  }
})

/**
 * @swagger
 * /api/personnel/vehicles/release:
 *   put:
 *     summary: Release a vehicle from a personnel
 *     description: Removes a vehicle assignment from a personnel.
 *     tags:
 *       - Personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personnelName
 *               - vehicleName
 *             properties:
 *               personnelName:
 *                 type: string
 *                 example: "john_doe"
 *               vehicleName:
 *                 type: string
 *                 example: "Car123"
 *     responses:
 *       200:
 *         description: Vehicle released successfully.
 */
personnelRouter.put(
  '/vehicles/release',
  async (req: Request, res: Response) => {
    try {
      const { personnelName, vehicleName } = req.body
      const updatedPersonnel =
        await PersonnelController.releaseVehicleFromPersonnel(
          personnelName.toString(),
          vehicleName.toString(),
        )
      res.status(200).json(updatedPersonnel)
    } catch (err) {
      const error = err as Error
      res.status(500).json({ error: error.message })
    }
  },
)

export default personnelRouter
