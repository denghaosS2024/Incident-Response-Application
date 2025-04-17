export default interface IFollowUpInfo {
    _id?: string; // MongoDB id of the hospital
    reportId: string 
    isSpotted: boolean 
    location: string 
    dateTimeSpotted: Date
    timestamp?: Date 
    additionalComment: string

    // TODO: Add Image URL????
  }
  