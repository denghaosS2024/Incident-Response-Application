import mongoose from "mongoose";
import MissingPersonFollowUpController from "../../src/controllers/MissingPersonFollowUpController";
import MissingFollowUp, { IMissingFollowUpBase } from "../../src/models/MissingFollowUp";
import * as TestDatabase from "../utils/TestDatabase";

describe("MissingPersonFollowUpController", () => {
  beforeAll(async () => await TestDatabase.connect());

  afterAll(async () => await TestDatabase.close());

  it('should add new follow up report', async() => {
    const newFollowUp: IMissingFollowUpBase = {
        reportId: new mongoose.Types.ObjectId(),
        isSpotted: true, 
        locationSpotted: "123 South Akron Rd. Mountain View, CA 94075",
        datetimeSpotted: new Date("2025-10-27T19:30"),
        additionalComment: "addtional comment"

    } ;

    const followUp = await MissingPersonFollowUpController.addFollowUp(newFollowUp);

    expect(followUp).toBeDefined();
    expect(followUp.isSpotted).toBe(true);
    expect(followUp._id).toBeDefined();
  });

  it('throw error by mongoDB', async() => {

    jest.spyOn(MissingFollowUp.prototype, 'save').mockRejectedValueOnce(new Error("some mongo error")
);

    const newFollowUp: IMissingFollowUpBase = {
        reportId: new mongoose.Types.ObjectId(),  
        isSpotted: true,
        locationSpotted: "123 South Akron Rd. Mountain View, CA 94075",
        datetimeSpotted: new Date("2025-10-28T11:45"),
        additionalComment: "Random comment",
      };

      await expect(
        MissingPersonFollowUpController.addFollowUp(newFollowUp)
      ).rejects.toThrow("Failed to add Follow Up info");
  });

  it("should return all followups for specific report", async() => {
    const newFollowUp: IMissingFollowUpBase = {
        reportId: new mongoose.Types.ObjectId(),
        isSpotted: true, 
        locationSpotted: "123 South Akron Rd. Mountain View, CA 94075",
        datetimeSpotted: new Date("2025-10-27T19:30"),
        additionalComment: "additional comment"

    };

    const followUp = await MissingPersonFollowUpController.addFollowUp(newFollowUp);

    const reportFollowUpList = await MissingPersonFollowUpController.getAllFollowUpsByReportId(followUp.reportId.toString());

    expect(reportFollowUpList.length).toBeGreaterThan(0);
    expect(reportFollowUpList[0].additionalComment).toBe("additional comment");
  })

  it("should handle error for get all followups for specific report", async() => {

    jest.spyOn(MissingFollowUp.prototype, 'find').mockRejectedValueOnce(new Error("some mongo error"));
    const newFollowUp: IMissingFollowUpBase = {
        reportId: new mongoose.Types.ObjectId(),
        isSpotted: true, 
        locationSpotted: "123 South Akron Rd. Mountain View, CA 94075",
        datetimeSpotted: new Date("2025-10-27T19:30"),
        additionalComment: "additional comment"

    };

    const followUp = await MissingPersonFollowUpController.addFollowUp(newFollowUp);

    await expect(MissingPersonFollowUpController.getAllFollowUpsByReportId(followUp.reportId.toString()))
    .rejects.toThrow("Error fetching all followups for this reportId");

  })
})