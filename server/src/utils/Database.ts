/**
 * Database Utility
 *
 * This utility provides functions for connecting to and closing the MongoDB database.
 * It also imports models to ensure their schemas are registered with Mongoose.
 */

import mongoose from 'mongoose'

// Import models to ensure their schemas are registered
import '../models/Channel'
import '../models/Message'
import '../models/User'

import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

/**
 * Connect to the MongoDB database
 * @param url - The MongoDB connection URL (default: constructed from environment variables)
 */
export const connect = async (
  url = `${process.env.MONGODB_URL}/${process.env.MONGODB_DB_NAME}`,
) => {
  await mongoose.connect(url)
}

/**
 * Close the MongoDB connection
 */
export const close = async () => {
  mongoose.connection.close()
}
