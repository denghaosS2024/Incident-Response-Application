/**
 * Main Router
 *
 * This file serves as the entry point for all API routes.
 * It aggregates all the sub-routers for different resources (users, login, channels)
 * and mounts them on the main router.
 */

import { Router } from 'express'

import user from './user'
import login from './login'
import channel from './channel'

export default Router()
  .use('/users', user)
  .use('/login', login)
  .use('/channels', channel)
