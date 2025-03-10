/**
 * Main Router
 *
 * This file serves as the entry point for all API routes.
 * It aggregates all the sub-routers for different resources (users, login, channels)
 * and mounts them on the main router.
 */

import { Router } from 'express'

import carRouter from './car'
import channel from './channel'
import cityRouter from './city'
import incident from './incident'
import login from './login'
import map from './map'
import profileRouter from './profile'
import truckRouter from './truck'
import user from './user'
import WildfireArea from './WildfireArea'

export default Router()
  .use('/users', user)
  .use('/login', login)
  .use('/channels', channel)
  .use('/incidents', incident)
  .use('/map', map)
  .use('/cars', carRouter)
  .use('/trucks', truckRouter)
  .use('/cities', cityRouter)
  .use('/profiles', profileRouter)
  .use('/wildfireAreas', WildfireArea)
