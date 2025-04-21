import MissingFollowUp, { IMissingFollowUpBase } from "../models/MissingFollowUp";


class MissingPersonFollowUpController {
    /**
     * add new follow up information
     * @param IMissingFollowUp
     * @returns The inserted entry 
     * @throws HttpError if no reportId which the follow up is for, is found.
     */
    async addFollowUp(newFollowUp: Partial<IMissingFollowUpBase>){
        try {
            // Create the IMissingFollowUp entity using input param 
            const newMissingFollowUp = new MissingFollowUp({
                reportId: newFollowUp.reportId,
                isSpotted: newFollowUp.isSpotted,
                locationSpotted: newFollowUp.locationSpotted,
                datetimeSpotted: newFollowUp.datetimeSpotted,
                additionalComment: newFollowUp.additionalComment
            });
            // add it to db 
            await newMissingFollowUp.save();
            return newMissingFollowUp;
        } catch (error) {
            console.error("Error adding FollowUp", error);
            throw new Error("Failed to add Follow Up info");

        }
    }
}

export default new MissingPersonFollowUpController();