export default interface IFollowUpInfo {
    _id?: string; // MongoDB id of the hospital
    reportId: string 
    isSpotted: boolean 
    locationSpotted: string 
    datetimeSpotted: Date
    timestamp?: Date 
    additionalComment: string

    // TODO: Add Image URL????
  }
  