/**
 * User Model
 *
 * Represents a user in the system with authentication capabilities.
 */

import bcrypt from 'bcrypt'
import mongoose, { Document, Schema, Model } from 'mongoose'

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

/**
 * Method to ensure a System Administator exits in the database.
 */
UserSchema.statics.ensureSystemUser = async function () {
  const username: string = "System"
  const password: string = "1234"
  const role = ROLES.ADMINISTRATOR

  try {
    const existingUser = await this.findOne({ username: username })

    if (!existingUser) {
      console.log('System user does not exist. Creating now.')      
      // Create user using new model instance to trigger pre-save hook
      const systemUser = new this({
        username: username,
        password: password,  // Plain password - will be hashed by pre-save hook
        role: role
      })
      await systemUser.save()
      console.log('System user created successfully.');
    } else {
      console.log('System user already exists.')
    }
  } catch (error) {
    console.error('Error creating system user:', error)
  }
}

export default mongoose.model<IUser, Model<IUser> & { ensureSystemUser: () => Promise<void> }>('User', UserSchema)