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

    jest.spyOn(MissingFollowUp.prototype, 'save').mockRejectedValueOnce(new Error("DB save failed")
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
      ).rejects.toThrow("DB save failed");
  });
})