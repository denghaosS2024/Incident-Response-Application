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

/**
 * @swagger
 * /api/cities/fire-funding/{cityName}:
 *   get:
 *     summary: Get the fire funding for a city
 *     description: Retrieves remaining fire funding for a specified city.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city to fetch fire funding for.
 *     responses:
 *       200:
 *         description: fire funding retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: Number
 */
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

/**
 * @swagger
 * /api/cities/police-funding/{cityName}:
 *   get:
 *     summary: Get the police funding for a city
 *     description: Retrieves remaining police funding for a specified city.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city to fetch police funding for.
 *     responses:
 *       200:
 *         description: police funding retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: Number
 */
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

/**
 * @swagger
 * /api/cities/funding-history/{cityName}/{role}:
 *   get:
 *     summary: Get funding history for a specific city
 *     description: >
 *       Retrieves the fire or police funding history for a given city, depending on the role provided.
 *       Use `"Fire Chief"` to retrieve fire funding history, or `"Police Chief"` for police funding history.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         example: MountainView
 *         description: The name of the city.
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Fire Chief, Police Chief]
 *         example: Fire Chief
 *         description: The role requesting the funding history.
 *     responses:
 *       200:
 *         description: Successfully retrieved funding history records.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FundingHistory'
 *       400:
 *         description: Bad request due to invalid input or internal error.
 */
cityRouter.get(
  "/funding-history/:cityName/:role",
  async (req: Request, res: Response) => {
    try {
      const { cityName, role } = req.params;
      if (role == "Fire Chief") {
        const funding =
          await CityController.getCityFireFundingHistory(cityName);
        res.status(200).json(funding);
      } else if (role == "Police Chief") {
        const funding =
          await CityController.getCityPoliceFundingHistory(cityName);
        res.status(200).json(funding);
      }
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /api/cities/funding-history/{cityName}/{role}:
 *   post:
 *     summary: Add a new funding history record for a city
 *     description: >
 *       Adds a new funding history record (Assign or Request) for a specific city.
 *       The operation is based on the requester's role ("Fire Chief" or "Police Chief").
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         example: MountainView
 *         description: The name of the city to add funding history to.
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Fire Chief, Police Chief]
 *         example: Fire Chief
 *         description: The role of the sender (determines which funding history to add to).
 *       - in: header
 *         name: x-application-uid
 *         required: true
 *         schema:
 *           type: string
 *         example: 6636a21b5e21a5df1c123456
 *         description: MongoDB ObjectId of the sender (Personnel).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - reason
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Assign, Request]
 *                 example: Request
 *               amount:
 *                 type: number
 *                 example: 5000
 *               reason:
 *                 type: string
 *                 example: Emergency response upgrade
 *     responses:
 *       201:
 *         description: Funding history added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       400:
 *         description: Bad request due to missing parameters or internal error.
 */
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

/**
 * @swagger
 * /api/cities/remaining-funding/{cityName}:
 *   get:
 *     summary: Get remaining funding for a specific city
 *     description: Retrieves the remaining funding amount for a given city.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         example: MountainView
 *         description: The name of the city.
 *     responses:
 *       200:
 *         description: Successfully retrieved remaining funding.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remainingFunding:
 *                   type: number
 *                   example: 15000
 *       400:
 *         description: Bad request due to invalid input or internal error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid city name provided."
 */
cityRouter.get(
  "/remaining-funding/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const funding = await CityController.getCityRemainingFunding(cityName);
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /api/cities/{cityName}/unassigned-funding-requests/{role}:
 *   get:
 *     summary: Get unassigned funding requests for a specific city
 *     description: Retrieves unassigned funding requests for a given city based on the role (Fire Chief or Police Chief).
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         example: MountainView
 *         description: The name of the city.
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Fire Chief, Police Chief]
 *         example: Fire Chief
 *         description: The role requesting the unassigned funding.
 *     responses:
 *       200:
 *         description: Successfully retrieved unassigned funding request amount.
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 *               example: 21000
 *               description: The total amount of unassigned funding requests for the specified department.
 *       400:
 *         description: Bad request, possibly due to invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "City not found"
 */
cityRouter.get(
  "/:cityName/unassigned-funding-requests/:role",
  async (req: Request, res: Response) => {
    try {
      const { cityName, role } = req.params;
      const funding = await CityController.getCityUnassignedFundingRequests(
        cityName,
        role,
      );
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);
/**
 * @swagger
 * /api/cities/remaining-funding/{cityName}:
 *   post:
 *     summary: Update the remaining funding of a city
 *     description: >
 *       Updates the `remainingFunding` field for a specified city by name.
 *       This is typically used to manually set the current remaining funds for the city (e.g. after spending calculations).
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *         example: MountainView
 *         description: The name of the city to update remaining funding for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 12000
 *                 description: The new remaining funding amount.
 *     responses:
 *       200:
 *         description: Remaining funding updated successfully.
 *       400:
 *         description: Bad request due to invalid input or internal error.
 */
cityRouter.post(
  "/remaining-funding/:cityName",
  async (req: Request, res: Response) => {
    try {
      const { cityName } = req.params;
      const { amount } = req.body;
      const funding = await CityController.updateCityRemainingFunding(
        cityName,
        amount,
      );
      res.json(funding);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ error: error.message });
    }
  },
);

export default cityRouter;
