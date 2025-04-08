import IUser from "./User";

/**
 * Message Interface
 *
 * Defines the structure of a message object in the application.
 */
export default interface IMessage {
  _id: string; // Unique identifier for the message
  sender: IUser; // User object representing the sender of the message
  timestamp: string; // Timestamp of when the message was sent
  channelId: string; // Identifier of the channel the message belongs to
  content: string; // The actual text content of the message
  isAlert: boolean; //whether is alert
  responders?: IUser[]; // List of user IDs who have responded to the message
  acknowledgedBy?: IUser[]; // List of user IDs who have acknowledged the message
  acknowledgedAt?: string[]; // List of timestamps when the message was acknowledged
  responses?: {
    userId: string | IUser;
    response: string;
    timestamp: string;
  }[]; // List of responses to the message (ACCEPT/BUSY)
}
