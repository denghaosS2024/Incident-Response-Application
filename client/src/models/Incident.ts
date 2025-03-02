import { EmergencyQuestions, FireQuestions, MedicalQuestions, PoliceQuestions } from "@/utils/types"
import IUser from "./User"

/**
 * Incident Interface
 *
 * Defines the structure of an incident object in the application.
 */

export enum IncidentPriority {
  E = 'Immediate',
  One = 'Urgent',
  Two = 'Could Wait',
  Three = 'Dismiss',
  U = 'Unset'
}

export enum IncidentType {  
  F = 'Fire',
  M = 'Medical',
  P = 'Police',
  U = "Unset"
}

export default interface IIncident {
  _id: string // Unique identifier for the incident
  caller: string // User object representing the sender of the incident
  timestamp: string // Timestamp of when the incident was create
  state: string // Identifier of the state of the incident
  owner: string // The owner of the incident
  commander: string // The commander of the incident
  address: string // The address of the user who created the incident
  type: IncidentType // The type of the incident
  questions: MedicalQuestions | FireQuestions | PoliceQuestions | EmergencyQuestions | null
  incidentCallGroup?: string; // ID of the associated chat channel
  priority: IncidentPriority // The priority of the incident
}
