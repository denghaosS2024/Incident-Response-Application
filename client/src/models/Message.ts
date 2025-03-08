import IUser from './User'

/**
 * Message Interface
 *
 * Defines the structure of a message object in the application.
 */
export default interface IMessage {
  _id: string // Unique identifier for the message
  sender: IUser // User object representing the sender of the message
  timestamp: string // Timestamp of when the message was sent
  channelId: string // Identifier of the channel the message belongs to
  content: string // The actual text content of the message
  isAlert: boolean //whether is alert
}
