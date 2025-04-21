import mongoose from "mongoose";
import { IMissingFollowUpBase } from "../../src/models/MissingFollowUp";
import * as TestDatabase from "../utils/TestDatabase";

describe("MissingPersonFollowUpController", () => {
  beforeAll(async () => await TestDatabase.connect());

  afterAll(async () => await TestDatabase.close());

  it('should add new follow up report', async() => {
    const newFollowUp: IMissingFollowUpBase = {
        reportId: new mongoose.Types.ObjectId(),
        isSpotted: true, 
        locationSpotted: "123 South Akron Rd. Mountain View, CA 94075",
        datetimeSpotted: new Date("10-27-2025T19:30"),
        additionalComment: "addtional comment"

    } ;

    const followUp = new MissingPersonFollowUpController.addFollowUp(newFollowUp)

    expect(followUp).toBeDefined();
    expect(followUp.isSpotted).toBe(true);
    expect(followUp._id).toBeDefined();
  })
})