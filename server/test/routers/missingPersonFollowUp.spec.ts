import request from "supertest";
import app from "../../src/app";
import * as TestDatabase from "../utils/TestDatabase";


describe("Router - MissingPesonFollowUp", () => {
    beforeAll(TestDatabase.connect);
    afterAll(TestDatabase.close);

    it('should not create follow up if reference report not exist: 404', async() => {
        const newFollowUp = {
            reportId: "not exist",
            isSpotted: true, 
            locationSpotted: "some location", 
            datetimeSpotted: "2025-10-25T19:03",
            additionalComment: "some comment"
        };
        await request(app)
            .post("/api/missing-person-followup/")
            .send(newFollowUp)
            .expect(404);
    })
});