import { EmergencyQuestions, FireQuestions, MedicalQuestions, PoliceQuestions } from "@/utils/types"
import IUser from "./User"

/**
 * Incident Interface
 *
 * Defines the structure of an incident object in the application.
 */


export default interface IIncident {
  _id: string // Unique identifier for the message
  caller: string // User object representing the sender of the message
  timestamp: string // Timestamp of when the message was sent
  state: string // Identifier of the state of the incident
  owner: string // The owner of the incident
  commander: string // The commander of the incident
  address: string // The address of the user
  type: string // The type of the incident
  questions: MedicalQuestions | FireQuestions | PoliceQuestions | EmergencyQuestions | {}
}
