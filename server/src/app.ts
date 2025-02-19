/**
 * Main Application Setup
 *
 * This file sets up the Express application, including middleware and route configuration.
 * It also serves the static files for the client-side application.
 */

import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import swaggerUi from 'swagger-ui-express'
import { specs } from './config/swagger/swagger'
import router from './routers'

export default express()
  // Parse JSON request bodies
  .use(bodyParser.json())
  // Enable CORS for all routes
  .use(cors())
  // Mount the API routes
  .use('/api', router)
  // Swagger UI route - add this before API routes
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
  // Serve static files from the client build directory
  .use(
    express.static(path.join(__dirname, '..', '..', 'client', 'build'), {
      fallthrough: true,
    }),
  )
  // Fix static file serving in FireFox by serving index.html for all routes
  .use(
    '*',
    express.static(
      path.join(__dirname, '..', '..', 'client', 'build', 'index.html'),
    ),
  )
