import swaggerJsdoc from 'swagger-jsdoc'
import Env from '../../utils/Env'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEM Incident Response API',
      version: '1.0.0',
      description: 'API documentation for SEM Incident Response Application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: Env.getApiUrl(),
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routers/*.ts'],
}

export const specs = swaggerJsdoc(options)
