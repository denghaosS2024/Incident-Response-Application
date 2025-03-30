import { Router } from 'express'
import IncidentController from '../controllers/IncidentController'
import UserController from '../controllers/UserController'
import ROLES from '../utils/Roles'

export default Router()
    /**
     * @swagger
     * /api/logout:
     *   post:
     *     summary: Logout a user
     *     description: Logs out a user and invalidates their session.
     *     tags:
     *       - Logout
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               role:
     *                 type: string
     *                 description: The role of the user (e.g., dispatcher, police)
     *     responses:
     *       200:
     *         description: Logout successful
     *       400:
     *         description: User not found or invalid role
     *       500:
     *         description: An error occurred during logout
     */
    .post('/', async (request, response) => {
        try {
            const { username, role } = request.body
            const isCommander = await IncidentController.getIncidentByCommander(username)
            // Check if user is a dispatcher
            if (username && role === ROLES.DISPATCH) {
                // Handle dispatcher-specific logout
                await UserController.dispatcherLogout(username)
            } else if (username && isCommander.length > 0){
                // Handle incident commander logout
                await UserController.FirstResponderLogout(username, true)
            } else if (username && isCommander.length == 0 && (role === ROLES.FIRE || role === ROLES.POLICE)) {
                // Handel first responder logout (not incident commander)
                await UserController.FirstResponderLogout(username, false)
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
