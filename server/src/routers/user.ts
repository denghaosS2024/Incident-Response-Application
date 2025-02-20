// UserRouter handles operations related to users, such as registration and listing.
// It interacts with the User model and manages user authentication.

import { Router } from 'express'

import UserController from '../controllers/UserController'
import ROLES from '../utils/Roles'

export default Router()
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
  .post('/', async (request, response) => {
    const { username, password, phoneNumber, role = ROLES.CITIZEN } = request.body

    try {
      const user = (
        await UserController.register(username, password, phoneNumber, role)
      ).toObject()

      // Remove sensitive information before sending the response
      delete user.password
      delete user.__v

      response.send(user)
    } catch (e) {
      const error = e as Error
      response.status(400).send({ message: error.message })
    }
  })
  /**
   * List all users with their online status
   * @route GET /api/users
   * @returns {Array} An array of user objects, each containing _id, username, role, and online status
   */
  .get('/', async (_, response) => {
    const users = await UserController.listUsers()
    response.send(users)
  })
