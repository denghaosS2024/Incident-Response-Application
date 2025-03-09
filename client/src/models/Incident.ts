import { EmergencyQuestions, FireQuestions, MedicalQuestions, PoliceQuestions } from "@/utils/types"
import IUser from "./User"

/**
 * Incident Interface
 *
 * Defines the structure of an incident object in the application.
 */

export enum IncidentPriority {
  Immediate = 'E',
  Urgent = 'One',
  CouldWait = 'Two',
  Dismiss = 'Three',
  Unset = 'U'
}

export enum IncidentType {  
  Fire = 'F',
  Medical = 'M',
  Police = 'P',
  Unset = "U"
}

export default interface IIncident {
  _id: string // Unique identifier for the incident
  incidentId : string
  caller: string // User object representing the sender of the incident
  openingDate: string // Timestamp of when the incident was create
  incidentState: string // Identifier of the state of the incident
  owner: string // The owner of the incident
  commander: string // The commander of the incident
  address: string // The address of the user who created the incident
  type: IncidentType // The type of the incident
  questions: MedicalQuestions | FireQuestions | PoliceQuestions | EmergencyQuestions | null
  incidentCallGroup?: string; // ID of the associated chat channel
  priority: IncidentPriority // The priority of the incident
}
