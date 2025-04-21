import request from "supertest";
import app from "../../src/app";
import { Gender, Race } from "../../src/models/MissingPerson";
import * as TestDatabase from "../utils/TestDatabase";


describe("Router - MissingPesonFollowUp", () => {
    beforeAll(TestDatabase.connect);
    afterAll(TestDatabase.close);

    const createMissingPersonReport = async () => {
        const response = await request(app)
            .post("/api/missingPerson/register")  // Changed endpoint
            .send({
                name: "John Doe",
                age: 30,
                race: Race.White,
                gender: Gender.Male,
                dateLastSeen: new Date().toISOString(),
                // Optional fields
                weight: 180,
                height: 175,
                eyeColor: "blue",
                description: "Last seen wearing blue jeans and white t-shirt",
                locationLastSeen: "Central Park, New York"
            });
            console.log("yayaya", response.statusCode)
            console.log("yayaya",response.body)
            return response.body._id
      };

    it('should not create follow up if reference report not exist: 404', async() => {
        const newFollowUp = {
            reportId: "661f8c7e2c2a4a8f4b1d7e9a",
            isSpotted: true, 
            locationSpotted: "some location", 
            datetimeSpotted: "2025-10-25T19:03",
            additionalComment: "some comment"
        };
        const res = await request(app)
            .post("/api/missing-person-followup/")
            .send(newFollowUp)
            .expect(404);
    })

    it('should return 400 if reportId is not valid format (mongo _id hexstring)', async()=> {
        const newFollowUp = {
            reportId: "",
            isSpotted: true, 
            locationSpotted: "some location", 
            datetimeSpotted: "2025-10-25T19:03",
            additionalComment: "some comment"
        };
        const res = await request(app)
            .post("/api/missing-person-followup/")
            .send(newFollowUp)
            .expect(400);
    })

    it('should add Followup info when reference report exist: 201', async() => {
        // add a reference report 
        const reportId = await createMissingPersonReport(); 
        console.log("reportId",reportId)

        // add follow up
        const newFollowUp = {
            reportId: reportId,
            isSpotted: true, 
            locationSpotted: "some location", 
            datetimeSpotted: "2025-10-25T19:03",
            additionalComment: "some comment"
        };
        const res = await request(app)
            .post("/api/missing-person-followup/")
            .send(newFollowUp)
            .expect(201);

        expect(res.body.isSpotted).toBe(true);
        expect(res.body.additionalComment).toBe("some comment");
    })
});