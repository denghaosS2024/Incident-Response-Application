/**
 * Types Utility
 *
 * This file defines TypeScript interfaces used throughout the client application.
 */

import IHospital from "@/models/Hospital";
import IPatient from "@/models/Patient";
import IIncident from "../models/Incident";
import IMessage from "../models/Message";
import { IProfile } from "../models/Profile";
import IUser from "../models/User";
import { IHospitalResourceRequest } from "@/models/HospitalResourceRequest";

/**
 * Interface representing the state of hospitals in the application
 */
export interface HospitalState {
  hospitalData: IHospital | null;
  hospitals: IHospital[];
  loading: boolean;
  error: string | null;
}

/**
 * Interface representing a collection of messages, indexed by channel ID
 */
interface Messages {
  [channelId: string]: IMessage[];
}

/**
 * Interface representing the state of messages in the application
 */
export interface MessagesState {
  messages: Messages;
  loading: boolean;
  alerts: { [channelId: string]: boolean };
  error: string | null;
}

/**
 * Interface representing the state of contacts in the application
 */
export interface ContactsState {
  contacts: IUser[];
  loading: boolean;
  error: string | null;
}

export interface IncidentsState {
  incident: IIncident;
  loading: false; // Indicates if a incident operation is in progress
  error: null; // Stores any error that occurred during incident operations
}

/**
 * Interface representing the medical questions
 */
export interface MedicalQuestions {
  isPatient: boolean; // Whether or not he incident creator is the patient
  username: string; // The Username of the patient
  age: number; // The age of the patient
  sex: string; // The sex of the patient
  conscious: string; // The conscious state of the patient
  breathing: string; // The breathing state of the patient
  chiefComplaint: string; // The chief complain of the patient
}

/**
 * Interface representing the medical questions
 */
export interface FireQuestions {
  fireType: string; // Is it a wildfire or structure fire
  hasSmoke: string; // Whether or not they smell smoke
  hasFlames: string; // Whether or not they see flames
  hasHazards: string; // Whether or not there are hazardous materials present
  numPeople: number; // The number of people present within the fire perimeter
  otherDetails: string; // Other details related to the fire
}

/**
 * Interface representing the medical questions
 */
export interface PoliceQuestions {
  isSafe: string; // Is the person safe
  hasWeapons: string; // Whether or not weapons are involved
  suspectDescription: string; // Details about the suspect
  crimeDetails: string; // Details about the crime
}

export interface ProfileState {
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
}

export interface WildfireArea {
  areaId: string;
  coordinates: number[][];
  name?: string;
}

/**
 * Interface representing the state of patients in the application
 */
export interface PatientState {
  patients: IPatient[];
  loading: boolean;
  error: string | null;
}

export interface HospitalResourceRequestState {
  incomingRequests: IHospitalResourceRequest[];
  outgoingRequests: IHospitalResourceRequest[];
  loading: boolean;
  error: string | null;
}

export interface EmergencyQuestions
  extends MedicalQuestions,
    FireQuestions,
    PoliceQuestions {}

export interface Location {
  latitude: number;
  longitude: number;
}
