import MissingFollowUp, {
  IMissingFollowUpBase,
} from "../models/MissingFollowUp";

class MissingPersonFollowUpController {
  /**
   * add new follow up information
   * @param IMissingFollowUp
   * @returns The inserted entry
   */
  async addFollowUp(newFollowUp: Partial<IMissingFollowUpBase>) {
    try {
      // Create the IMissingFollowUp entity using input param
      const newMissingFollowUp = new MissingFollowUp({
        reportId: newFollowUp.reportId,
        isSpotted: newFollowUp.isSpotted,
        locationSpotted: newFollowUp.locationSpotted,
        datetimeSpotted: newFollowUp.datetimeSpotted,
        additionalComment: newFollowUp.additionalComment,
      });
      // add it to db
      await newMissingFollowUp.save();
      return newMissingFollowUp;
    } catch (error) {
      console.error("Error adding FollowUp", error);
      throw new Error("Failed to add Follow Up info");
    }
  }

  async getAllFollowUpsByReportId(reportId: string) {
    try {
      const reportFollowUpList = await MissingFollowUp.find({
        reportId: reportId,
      }).exec();
      return reportFollowUpList;
    } catch (error) {
      console.error("Error getting all followups for reportId", error);
      throw new Error("Error fetching all followups for this reportId");
    }
  }

  async getFollowUpById(id: string) {
    const individualFollowUp = await MissingFollowUp.findById(id).exec();
    return individualFollowUp;
  }
}

export default new MissingPersonFollowUpController();
