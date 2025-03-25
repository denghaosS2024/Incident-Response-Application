/**
 * Main Application Setup
 *
 * This file sets up the Express application, including middleware and route configuration.
 * It also serves the static files for the client-side application.
 */

import bodyParser from 'body-parser'
import cors from 'cors'
import express, { NextFunction, type Request, Response } from 'express'
import path from 'path'

import swaggerUi from 'swagger-ui-express'
import { specs } from './config/swagger/swagger'
import router from './routers'
import Env from './utils/Env'

function getCorsMiddleware() {
  const corsOptions = {
    origin: Env.getFrontendCorsUrl(),
    method: '*',
    allowedHeaders: '*',
    credentials: true,
  }

  return cors(corsOptions)
}

export async function getApp() {
  return (
    express()
      // Add request logging middleware
      .use((req: Request, _res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
        next()
      })
      // Parse JSON request bodies
      .use(bodyParser.json())
      // Enable CORS for all routes
      .use(getCorsMiddleware())
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
  )
}
