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
    fireType: string // Is it a wildfire or structure fire
    hasSmoke: string // Whether or not they smell smoke
    hasFlames: string // Whether or not they see flames
    hasHazards: string // Whether or not there are hazardous materials present
    numPeople: number // The number of people present within the fire perimeter
    otherDetails: string // Other details related to the fire
}

/**
 * Interface representing the medical questions
 */
export interface PoliceQuestions {
    isSafe: string // Is the person safe
    hasWeapons: string // Whether or not weapons are involved
    suspectDescription: string // Details about the suspect
    crimeDetails: string // Details about the crime
}

export interface EmergencyQuestions extends MedicalQuestions, FireQuestions, PoliceQuestions { }