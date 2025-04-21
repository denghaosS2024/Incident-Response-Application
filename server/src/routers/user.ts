// UserRouter handles operations related to users, such as registration and listing.
// It interacts with the User model and manages user authentication.

import { Router } from "express";
import UserController from "../controllers/UserController";
import HttpError from "../utils/HttpError";
import ROLES from "../utils/Roles";
import UserConnections from "../utils/UserConnections";
const router = Router();
router
  /**
   * Create a temporary user account for a patient
   * @route POST /api/users/createTemp
   * @returns {Object} An object containing a message and the new temporary username
   * @throws {400} If the user creation fails
   */
  .post("/createTemp", async (request, response) => {
    try {
      const callerUid = request.headers["x-application-uid"] as string;
      // hospitalId of the nurse that created the patient/empty if created by a First Responder
      const hospitalId = request.body.hospitalId;
      if (!callerUid) {
        throw new HttpError("Caller UID is required", 400);
      }
      const result = await UserController.createTempUserForPatient(
        hospitalId,
        callerUid,
      );
      response.status(201).send(result);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })
  /**
   * Register a new user
   * @route POST /api/users
   * @param {Object} request.body
   * @param {string} request.body.username - The username for the new user
   * @param {string} request.body.password - The password for the new user
   * @param {string} request.body.phoneNumber - The phone number for the new user
   * @param {ROLES} [request.body.role=ROLES.CITIZEN] - The role for the new user
   * @returns {Object} The created user object (without password and __v)
   * @throws {400} If the username already exists or other validation errors occur
   */
  .post("/", async (request, response) => {
    const { username, password, role = ROLES.CITIZEN } = request.body;

    try {
      const user = (
        await UserController.register(username, password, role)
      ).toObject();

      // Remove sensitive information before sending the response
      delete user.password;
      delete user.__v;

      response.send(user);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })
  /**
   * List all users with their online status
   * @route GET /api/users
   * @returns {Array} An array of user objects, each containing _id, username, role, and online status
   */
  .get("/", async (_, response) => {
    const users = await UserController.listUsers();
    response.send(users);
  })

  .get("/findByUsername", async (req, res) => {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    try {
      const result = await UserController.findUserIdByUsername(
        username as string,
      );
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(result);
    } catch (e) {
      const error = e as Error;
      return res.status(500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/users/usernames/:username:
   *   get:
   *     summary: Get a user by username
   *     description: Retrieve a user based on the username.
   *     parameters:
   *       - name: username
   *         in: path
   *         required: true
   *         description: The name of the city to retrieve chiefs from.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A user object.
   *         schema:
   *           type: array
   *       500:
   *         description: No username mataches.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: Error message.
   *     tags:
   *       - Users
   */
  .get("/usernames/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    try {
      const result = await UserController.getUserByUsername(username);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      res.send(result);
      return;
    } catch (e) {
      const error = e as Error;
      return res.status(500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/users/cities/directors/{cityName}:
   *   get:
   *     summary: Get the director of a city
   *     description: Retrieve a director user object in a specified city.
   *     parameters:
   *       - name: cityName
   *         in: path
   *         required: true
   *         description: The name of the city to retrieve director from.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A director in the specified city.
   *         schema:
   *           type: Object
   *       500:
   *         description: No city name matches.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: Error message.
   *     tags:
   *       - Users
   */
  .get("/cities/directors/:cityName", async (req, res) => {
    const { cityName } = req.params;
    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }

    try {
      const result = await UserController.getDirectorByCity(cityName);
      if (!result) {
        return res.status(404).json({ message: "Director not found" });
      }
      res.send(result);
      return;
    } catch (e) {
      const error = e as Error;
      return res.status(500).send({ message: error.message });
    }
  })

  /**
   * Get user's last known location
   * @route GET /api/users/:id/location
   * @param {string} request.params.id - The ID of the user
   * @returns {Object} An object containing latitude and longitude
   * @throws {400} If the user is not found
   */
  .get("/:id/location", async (request, response) => {
    const { id } = request.params;
    try {
      const location = await UserController.getUserLastLocation(id);
      response.send(location);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Update user's last known location
   * @route PATCH /api/users/:id/location
   * @param {string} request.params.id - The ID of the user
   * @param {number} request.body.latitude - The new latitude
   * @param {number} request.body.longitude - The new longitude
   * @returns {Object} The updated user object
   * @throws {400} If the user is not found or update fails
   */
  .patch("/:id/location", async (request, response) => {
    const { id } = request.params;
    const { latitude, longitude } = request.body;

    try {
      const updatedUser = await UserController.updateUserLastLocation(
        id,
        latitude,
        longitude,
      );
      response.send(updatedUser);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  })

  /**
   * Get user by ID
   * @route GET /api/users/:id
   * @param {string} request.params.id - User ID
   * @returns {Object} User object without password
   * @throws {404} If user not found
   */
  .get("/:id", async (request, response) => {
    const { id } = request.params;
    try {
      const user = await UserController.getUserById(id);
      if (!user) {
        return response.status(404).send({ message: "User not found" });
      }

      // Remove sensitive information before sending the response
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.__v;
      response.send(userObject);
      return;
    } catch (e) {
      const error = e as Error;
      return response.status(400).send({ message: error.message });
    }
  })

  /**
   * Register a nurse to a hospital
   * @route POST /api/users/register-hospital
   * @param {string} request.body.userId - The ID of the nurse
   * @param {string} request.body.hospitalId - The ID of the hospital
   * @returns {Object} A success message and the updated user object
   * @throws {400} If the user is not found or is not a nurse
   */
  .put("/:id/hospital", async (request, response) => {
    const { id } = request.params;
    const { hospitalId } = request.body;

    try {
      const result = await UserController.registerToHospital(id, hospitalId);
      UserConnections.joinHospitalRoom(id, hospitalId);
      response.status(200).send(result);
    } catch (e) {
      const error = e as HttpError;
      response.status(error.statusCode || 500).send({ message: error.message });
    }
  })

  /**
   * @swagger
   * /api/users/chiefs/{cityName}:
   *   get:
   *     summary: Get all chiefs in a city
   *     description: Retrieve a list of all chiefs in a specified city.
   *     parameters:
   *       - name: cityName
   *         in: path
   *         required: true
   *         description: The name of the city to retrieve chiefs from.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A list of chiefs in the specified city.
   *         schema:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               chiefId:
   *                 type: string
   *               username:
   *                 type: string
   *               role:
   *                 type: string
   *       404:
   *         description: Chiefs not found in the specified city.
   *       500:
   *         description: Internal server error.
   *         schema:
   *           type: object
   *           properties:
   *             message:
   *               type: string
   *               description: Error message.
   *     tags:
   *       - Users
   */
  .get("/chiefs/:cityName", async (req, res) => {
    const { cityName } = req.params;
    if (!cityName) {
      return res.status(400).json({ error: "City name is required" });
    }
    try {
      const result = await UserController.getChiefsByCity(cityName);
      if (!result) {
        return res.status(404).json({ message: "Chiefs not found" });
      }
      res.send(result);
      return;
    } catch (e) {
      const error = e as Error;
      return res.status(500).send({ message: error.message });
    }
  });

export default router;
