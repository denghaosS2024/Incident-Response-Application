import { Request, Response, Router } from "express";
import CityController from "../controllers/CityController";
import { Types } from "mongoose";

const cityRouter = Router();

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
cityRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const cities = await CityController.getAllCities();
    res.json(cities);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

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
cityRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newCity = await CityController.createCity(name);
    res.status(201).json(newCity);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

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
cityRouter.delete("/:cityId", async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;
    const removedCity = await CityController.removeCityById(cityId.toString());
    res.json({ message: "City deleted", city: removedCity });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

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
  "/assignments/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const assignments = await CityController.getCityAssignments(cityName);
      res.json(assignments);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

cityRouter.get(
  "/fire-funding/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const funding = await CityController.getCityFireFunding(cityName);
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

cityRouter.get(
  "/police-funding/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const funding = await CityController.getCityPoliceFunding(cityName);
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

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
  "/assignments/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const { type, name } = req.body;
      const updatedCity = await CityController.addCityAssignment(
        cityName,
        type,
        name,
      );
      res.json(updatedCity);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /api/cities/assignments/{type}/{name}:
 *   delete:
 *     summary: Unassign an entity from its current city
 *     description: >
 *       Removes the assignment of a Car, Truck, or Personnel from its current city by setting its `assignedCity` field to null.
 *       This operation uses a DELETE request with the entity type and name to trigger the unassignment.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Car, Truck, Personnel]
 *         example: Truck
 *         description: The type of the entity to unassign.
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: Truck55
 *         description: The name of the entity to unassign.
 *     responses:
 *       200:
 *         description: The entity has been successfully unassigned.
 *       400:
 *         description: Unassignment failed due to invalid input or internal error.
 */

cityRouter.delete(
  "/assignments/:type/:name",
  async (req: Request, res: Response) => {
    try {
      const { type, name } = req.params;
      const formattedType =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      const result = await CityController.addCityAssignment(
        "",
        formattedType as "Car" | "Truck" | "Personnel",
        name,
      );
      res.json(result);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

cityRouter.get(
  "/fire-funding-history/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const funding = await CityController.getCityFireFundingHistory(cityName);
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

cityRouter.get(
  "/police-funding-history/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const funding =
        await CityController.getCityPoliceFundingHistory(cityName);
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

cityRouter.post(
  "/funding-history/:cityName/:role",
  async (req: Request, res: Response) => {
    try {
      const senderId = new Types.ObjectId(
        req.headers["x-application-uid"] as string,
      );
      const { cityName, role } = req.params;
      const { type, amount, reason } = req.body;
      if (role == "Fire Chief") {
        const city = await CityController.addCityFireFundingHistory(
          reason,
          type,
          senderId,
          amount,
          cityName,
        );
        console.log(city);
        res.status(201).json(city);
      } else if (role == "Police Chief") {
        const city = await CityController.addCityPoliceFundingHistory(
          reason,
          type,
          senderId,
          amount,
          cityName,
        );
        console.log(city);
        res.status(201).json(city);
      }
      res.status(404);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

export default cityRouter;
