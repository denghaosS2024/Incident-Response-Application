/**
 * Group Model
 *
 * Represents a group where users can send messages.
 * This model is similar to a Slack group.
 * Actually extends Channel
 */

import mongoose, { Schema, Model } from 'mongoose'
import AutoPopulate from 'mongoose-autopopulate'

import { IChannel } from './Channel'

export interface IGroup extends IChannel {
    groupBenifit?: string[]
  }
  
  
/** 
 * Interface for the Group model
 */

export interface IGroupModel extends Model<IGroup> {
    getAllGroups: () => Promise<IGroup[]>
    getGroupsByUser: (userId: string) => Promise<IGroup[]>
    getGroupById: (groupId: string) => Promise<IGroup | null>
  }

  /**
 * Group Schema
 */
const GroupSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    users: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        autopopulate: {
          select: '-password -__v',
        },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      autopopulate: {
        select: '-password -__v',
      },
    },
    closed: { type: Boolean, default: false },
    messages: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Message',
        autopopulate: true,
      },
    ],
    groupBenifit: {
      type: [String],
      required: false,
    }
  })
  
GroupSchema.plugin(AutoPopulate)

/*
 * Static method to get all groups
 * Returns an array of all groups in the database
 * @returns {Promise} A promise that resolves to an array of groups
 */
GroupSchema.statics.getAllGroups = async function () {
  return this.find({})
}

/*
 * Static method to get groups by user
 * Returns an array of groups such that their users contain the given user ID.
 * @param {string} userId - The ID of the user
 * @returns {Promise} A promise that resolves to an array of groups
 */

GroupSchema.statics.getGroupsByUser = async function (userId: string) {
  return this.find({ users: userId })
}

/*
 * Static method to get a group by ID
 * @param {string} groupId - The ID of the group
 * @returns {Promise} A promise that resolves to the group object
 */
GroupSchema.statics.getGroupById = async function (groupId: string) {
  return this.findById(groupId)
}

const Group = mongoose.model<IGroup, IGroupModel>(
  'Group',
  GroupSchema,
)

export default Group
