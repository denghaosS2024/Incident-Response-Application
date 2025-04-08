// LoginRouter handles user login operations and generates authentication tokens.
// It interacts with the User model and manages user authentication.

import { Router } from "express";

import UserController from "../controllers/UserController";

export default Router()
  /**
   * Authenticate user and generate login token
   * @route POST /api/login
   * @param {Object} request.body
   * @param {string} request.body.username - The username of the user trying to log in
   * @param {string} request.body.password - The password of the user trying to log in
   * @returns {Object} An object containing the authentication token, user ID, and role
   * @throws {400} If the user doesn't exist or the password is incorrect
   */
  .post("/", async (request, response) => {
    const { username, password } = request.body;

    try {
      const result = await UserController.login(username, password);
      response.send(result);
    } catch (e) {
      const error = e as Error;
      response.status(400).send({ message: error.message });
    }
  });
