// UserController handles user-related operations such as registration, login, and listing users.
// It interacts with the User model and manages user authentication.

import Channel from '../models/Channel'
import User, { IUser } from '../models/User'
import ROLES from '../utils/Roles'
import * as Token from '../utils/Token'
import UserConnections from '../utils/UserConnections'

class UserController {
  /**
   * Register a new user
   * @param username - The username for the new user
   * @param password - The password for the new user
   * @param phoneNumber - The phone number for the new user
   * @param role - The role for the new user (default: ROLES.CITIZEN)
   * @returns The newly created user object
   * @throws Error if the username already exists
   */
  async register(
    username: string,
    password: string,
    phoneNumber: string,
    role: ROLES = ROLES.CITIZEN,
  ) {
    // Check if user already exists
    let user = await User.findOne({ username }).exec()

    if (user) {
      throw new Error(`User "${username}" already exists`)
    } else {
      // Create and save new user
      user = await new User({
        username,
        password,
        phoneNumber,
        role,
      }).save()

      // Subscribe the new user to the public channel
      const publicChannel = await Channel.getPublicChannel()
      publicChannel.users.push(user._id)
      publicChannel.save()
    }

    // NOTE: password is still visible in the user instance.
    // TODO: Consider removing the password field before returning the user object
    return user
  }

  /**
   * Authenticate user and generate login token
   * @param username - The username of the user trying to log in
   * @param password - The password of the user trying to log in
   * @returns An object containing the authentication token, user ID, and role
   * @throws Error if the user doesn't exist or the password is incorrect
   */
  async login(username: string, password: string) {
    const user = await User.findOne({ username })
      .select('+password') // Include password field which is usually excluded
      .exec()

    if (user) {
      const isMatch = await user.comparePassword(password)

      if (isMatch) {
        return {
          token: Token.generate(user.id),
          _id: user.id,
          role: user.role,
        }
      }
    }

    throw new Error(`User "${username}" does not exist or incorrect password`)
  }

  /**
   * List all users with their online status
   * @returns An array of user objects, each containing _id, username, role, and online status
   */
  async listUsers() {
    const users = await User.find().exec()

    return users.map((user) => ({
      ...(user.toJSON() as Pick<IUser, '_id' | 'username' | 'role'>),
      online: UserConnections.isUserConnected(user.id),
    }))
  }
}

export default new UserController()
