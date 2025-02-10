/**
 * Types Utility
 *
 * This file defines TypeScript interfaces used throughout the client application.
 */

import IMessage from '@/models/Message'
import IUser from '@/models/User'

/**
 * Interface representing a collection of messages, indexed by channel ID
 */
interface Messages {
  [channelId: string]: IMessage[]
}

/**
 * Interface representing the state of messages in the application
 */
export interface MessagesState {
  messages: Messages
  loading: boolean
  error: string | null
}

/**
 * Interface representing the state of contacts in the application
 */
export interface ContactsState {
  contacts: IUser[]
  loading: boolean
  error: string | null
}

/**
 * Interface representing the root state of the application
 */
export interface RootState {
  messageState: MessagesState
  contactState: ContactsState
}
