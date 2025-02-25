/**
 * User Model
 *
 * Represents a user in the system with authentication capabilities.
 */

import bcrypt from 'bcrypt'
import mongoose, { Document, Schema } from 'mongoose'

import ROLES from '../utils/Roles'

const SALT_WORK_FACTOR = 10

/**
 * Interface for the User document
 */
export interface IUser extends Document {
  username: string
  password?: string
  // phoneNumber?: string
  role: string

  comparePassword: (candidatePassword: string) => Promise<boolean>
}

/**
 * User Schema
 */
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: { type: String, required: true, select: false },
  // phoneNumber: { type: String, required: true },
  role: { type: String, required: true, default: ROLES.CITIZEN },
  __v: { type: Number, select: false },
})

/**
 * Pre-save hook to hash the password before saving the user to the database
 */
UserSchema.pre('save', function (next) {
  const user = this as IUser

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password!, salt, (err, hash) => {
      if (err) return next(err)

      // overwrite the plaintext password with the hashed one
      user.password = hash
      next()
    })
  })
})

/**
 * Method to compare a given password with the user's hashed password
 */
UserSchema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password!, (error, isMatch) => {
      if (error) {
        reject(error)
      } else {
        resolve(isMatch)
      }
    })
  })
}

export default mongoose.model<IUser>('User', UserSchema)
