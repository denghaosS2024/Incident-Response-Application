import { Router } from 'express'
import UserController from '../controllers/UserController'
import ROLES from '../utils/Roles'

export default Router().post('/', async (request, response) => {
    try {
        const { username, role } = request.body
        // Check if user is a dispatcher
        if (username && role === ROLES.DISPATCH) {
            // Handle dispatcher-specific logout
            await UserController.dispatcherLogout(username)
        } else {
            // Normal logout for non-dispatchers
            await UserController.logout(username)
        }

        return response.status(200).json({ message: 'Logout successful' })
    } catch (error) {
        console.error('Logout error:', error)
        return response
            .status(500)
            .json({ message: 'An error occurred during logout' })
    }
})
