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
  alerts: { [channelId: string]: boolean }
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

/**
 * Interface representing the medical questions
 */
export interface MedicalQuestions {
  isPatient: boolean // Whether or not he incident creator is the patient
  username: string // The Username of the patient
  age: number // The age of the patient
  sex: string // The sex of the patient
  conscious: string // The conscious state of the patient
  breathing: string // The breathing state of the patient
  chiefComplaint: string // The chief complain of the patient
}

/**
 * Interface representing the medical questions
 */
export interface FireQuestions {
  isPatient: boolean // Whether or not he incident creator is the patient
  username: string // The Username of the patient
  age: number // The age of the patient
  sex: string // The sex of the patient
  conscious: string // The conscious state of the patient
  breathing: string // The breathing state of the patient
  chiefComplaint: string // The chief complain of the patient
}

